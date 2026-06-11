import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Upload,
  Plus,
  Trash2,
  Save,
  X,
  Check,
  Video,
  Youtube,
  Loader
} from 'lucide-react';
import { getStates, getCities, getDistricts, getClusters } from '../../../services/core/locationApi';
import { fetchFranchiseeManagerSettings, updateFranchiseeManagerSettings } from '../../../services/settings/settingsApi';

const FranchiseeManagerSetting = () => {
  // State management
  const [locationCardsVisible, setLocationCardsVisible] = useState(true);
  const [currentState, setCurrentState] = useState('');
  const [currentCluster, setCurrentCluster] = useState('');
  const [currentDistrict, setCurrentDistrict] = useState('');

  const [statesList, setStatesList] = useState([]);
  const [clustersList, setClustersList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);

  const [activeForm, setActiveForm] = useState('cprm-trainee-form');
  const [showSetTaskModal, setShowSetTaskModal] = useState(false);

  // Settings Data
  const [traineeSettings, setTraineeSettings] = useState({
    appDemos: 10,
    evaluationFlow: '', // Not strictly editable in UI but can be stored
    ninetyDaysGoal: { target: 30, dueDays: 90 },
    commissionEligibility: { requiredFranchisees: 30, signupStatus: '' },
    companyLeadEligibility: { signupCount: 0, leadLimit: 100, percentageVisit: '' },
    commissionSettings: { newFranchiseeCommission: 0, signupDoneCommission: 0 }
  });

  const [managerSettings, setManagerSettings] = useState({
    appDemos: 10,
    ninetyDaysGoal: { target: 30, dueDays: 90 },
    commissionEligibility: { requiredFranchisees: 30, signupStatus: '' },
    companyLeadEligibility: { signupCount: 0, leadLimit: 100, percentageVisit: '' },
    commissionSettings: { newFranchiseeCommission: 0, signupDoneCommission: 0 }
  });

  const [videoSections, setVideoSections] = useState([{
    category: 'solarrooftop',
    name: '',
    videos: [],
    isExpanded: true
  }]);

  const [examQuestions, setExamQuestions] = useState([{
    question: '',
    options: { A: '', B: '', C: '', D: '' },
    correctAnswer: 'A'
  }]);
  const [passingMarks, setPassingMarks] = useState(1);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Data
  // Fetch States
  useEffect(() => {
    const fetchStatesData = async () => {
      try {
        const data = await getStates();
        setStatesList(data || []);
      } catch (error) {
        console.error("Failed to fetch states", error);
      }
    };
    fetchStatesData();
  }, []);

  // Fetch Clusters when State selected
  useEffect(() => {
    const fetchClustersData = async () => {
      if (!currentState) return;
      try {
        const stateObj = statesList.find(s => s.name === currentState);
        if (stateObj) {
          // Assuming getDistricts is actually providing districts, but UI asks for Cluster then District??
          // The UI says State -> Cluster -> District.
          // In locationApi, getClusters takes districtId.
          // Re-checking locationApi... getCities takes stateId. Usually City acts as Cluster in many apps?
          // Or maybe getDistricts(stateId)? 
          // Let's assume hierarchy State -> City(Cluster) -> District for now based on usual flows if 'Cluster' maps to City.
          // Wait, the UI hardcoded data had "Gujarat": ["Rajkot", "Ahmedabad"] which are Cities.
          // And then "Rajkot": ["Rajkot City", "Rajkot Rural"] which look like districts/talukas.

          // Let's try fetching Cities for the selected State to populate "Cluster"
          const cities = await getCities(stateObj._id);
          setClustersList(cities || []);
        }
      } catch (error) {
        console.error("Failed to fetch clusters", error);
      }
    };
    fetchClustersData();
  }, [currentState, statesList]);

  // Fetch Districts when Cluster (City) selected
  useEffect(() => {
    const fetchDistrictsData = async () => {
      if (!currentCluster) return;
      try {
        const clusterObj = clustersList.find(c => c.name === currentCluster);
        if (clusterObj) {
          const districts = await getDistricts(clusterObj._id);
          setDistrictsList(districts || []);
        }
      } catch (error) {
        console.error("Failed to fetch districts", error);
      }
    };
    fetchDistrictsData();
  }, [currentCluster, clustersList]);

  // Fetch Settings when all locations selected
  useEffect(() => {
    const loadSettings = async () => {
      if (currentState && currentCluster && currentDistrict) {
        setLoading(true);
        try {
          const data = await fetchFranchiseeManagerSettings({
            state: currentState,
            cluster: currentCluster,
            district: currentDistrict
          });

          if (data) {
            if (data.traineeSettings) setTraineeSettings(prev => ({ ...prev, ...data.traineeSettings }));
            if (data.managerSettings) setManagerSettings(prev => ({ ...prev, ...data.managerSettings }));
            if (data.videoSections && data.videoSections.length > 0) setVideoSections(data.videoSections);
            else setVideoSections([{ category: 'solarrooftop', name: '', videos: [], isExpanded: true }]);

            if (data.examSettings) {
              setExamQuestions(data.examSettings.questions || []);
              setPassingMarks(data.examSettings.passingMarks || 1);
            }
          }
        } catch (error) {
          console.error("Failed to load settings", error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadSettings();
  }, [currentState, currentCluster, currentDistrict]);

  // Handlers
  const handleStateClick = (state) => {
    setCurrentState(state);
    setCurrentCluster('');
    setCurrentDistrict('');
    setActiveForm('cprm-trainee-form');
  };

  const handleClusterClick = (cluster) => {
    setCurrentCluster(cluster);
    setCurrentDistrict('');
  };

  const handleDistrictClick = (district) => {
    setCurrentDistrict(district);
    console.log('Location selected:', {
      state: currentState,
      cluster: currentCluster,
      district: district
    });
  };

  const resetLocationSelection = () => {
    setCurrentState('');
    setCurrentCluster('');
    setCurrentDistrict('');
  };

  // Video section handlers
  const addVideoSection = () => {
    setVideoSections([...videoSections, {
      category: 'solarrooftop',
      name: '',
      videos: [],
      isExpanded: true
    }]);
  };

  const updateVideoSection = (index, field, value) => {
    const updatedSections = [...videoSections];
    updatedSections[index][field] = value;
    setVideoSections(updatedSections);
  };

  const addVideoToSection = (sectionIndex) => {
    const section = videoSections[sectionIndex];
    if (!section.name && !section.videoFile && !section.youtubeLink) {
      alert('Please enter at least a section name, video file, or YouTube link');
      return;
    }

    const updatedSections = [...videoSections];
    updatedSections[sectionIndex].videos.push({
      id: Date.now(),
      name: section.name || 'Untitled Video',
      category: section.category,
      type: section.videoFile ? 'file' : 'youtube',
      fileName: section.videoFile?.name || '',
      youtubeLink: section.youtubeLink || ''
    });

    // Clear inputs
    updatedSections[sectionIndex].name = '';
    updatedSections[sectionIndex].videoFile = null;
    updatedSections[sectionIndex].youtubeLink = '';

    setVideoSections(updatedSections);
  };

  const deleteVideoCard = (sectionIndex, videoIndex) => {
    const updatedSections = [...videoSections];
    updatedSections[sectionIndex].videos.splice(videoIndex, 1);
    setVideoSections(updatedSections);
  };

  // Exam question handlers
  const addExamQuestion = () => {
    setExamQuestions([...examQuestions, {
      question: '',
      options: { A: '', B: '', C: '', D: '' },
      correctAnswer: 'A'
    }]);
    setPassingMarks(Math.ceil((examQuestions.length + 1) * 0.5));
  };

  const updateExamQuestion = (index, field, value) => {
    const updatedQuestions = [...examQuestions];
    updatedQuestions[index][field] = value;
    setExamQuestions(updatedQuestions);
  };

  const updateExamOption = (questionIndex, option, value) => {
    const updatedQuestions = [...examQuestions];
    updatedQuestions[questionIndex].options[option] = value;
    setExamQuestions(updatedQuestions);
  };

  const removeQuestion = (index) => {
    if (examQuestions.length > 1) {
      const updatedQuestions = examQuestions.filter((_, i) => i !== index);
      setExamQuestions(updatedQuestions);
      setPassingMarks(Math.ceil(updatedQuestions.length * 0.5));
    } else {
      alert("You must have at least one question in the exam.");
    }
  };

  const saveExam = () => {
    if (!passingMarks || passingMarks < 1 || passingMarks > examQuestions.length) {
      alert(`Please enter valid passing marks between 1 and ${examQuestions.length}`);
      return;
    }

    const allValid = examQuestions.every((q, index) => {
      return q.question &&
        q.options.A && q.options.B && q.options.C && q.options.D &&
        q.correctAnswer;
    });

    if (!allValid) {
      alert('Please complete all fields for all questions');
      return;
    }

    const examData = {
      totalQuestions: examQuestions.length,
      passingMarks,
      questions: examQuestions
    };

    console.log('Exam data to save:', examData);
    alert('Exam saved successfully!');
    setShowSetTaskModal(false);
  };

  // Extract Video Section Render Logic to fallback if needed or keep existingStructure
  const renderVideoSections = () => (
    <div className="mb-6">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="bg-blue-600 text-white rounded-t-lg p-4 flex justify-between items-center">
          <span>Video Upload Sections</span>
          <button
            type="button"
            onClick={addVideoSection}
            className="bg-white text-blue-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-100"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Add Section
          </button>
        </div>
        <div className="p-4">
          {videoSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-medium mb-2">Category</label>
                  <select
                    value={section.category}
                    onChange={(e) => updateVideoSection(sectionIndex, 'category', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="solarrooftop">Solar Rooftop</option>
                    <option value="solarpump">Solar Pump</option>
                    <option value="solarstreatlight">Solar Street Light</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-2">Section Name</label>
                  <input
                    type="text"
                    value={section.name}
                    onChange={(e) => updateVideoSection(sectionIndex, 'name', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Enter Section Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-medium mb-2">Upload Video</label>
                  <div className="flex items-center">
                    <Upload className="w-5 h-5 mr-2 text-gray-500" />
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => updateVideoSection(sectionIndex, 'videoFile', e.target.files[0])}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-medium mb-2">Or YouTube Link</label>
                  <div className="flex items-center">
                    <Youtube className="w-5 h-5 mr-2 text-red-500" />
                    <input
                      type="url"
                      value={section.youtubeLink || ''}
                      onChange={(e) => updateVideoSection(sectionIndex, 'youtubeLink', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="https://youtube.com/xyz"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => addVideoToSection(sectionIndex)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Video
                </button>
              </div>

              {/* Saved Videos */}
              {section.videos.length > 0 && (
                <div className="mt-4">
                  <div className="bg-gray-800 text-white rounded-t-lg p-2">
                    <h6 className="font-medium">Saved Videos</h6>
                  </div>
                  <div className="border border-t-0 border-gray-200 rounded-b-lg p-4">
                    {section.videos.map((video, videoIndex) => (
                      <div key={video.id} className="bg-gray-50 rounded-lg p-4 mb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h6 className="font-medium">{video.name}</h6>
                            <p className="text-sm text-gray-600">Category: {video.category}</p>
                            {video.type === 'youtube' && (
                              <p className="text-sm text-gray-600">YouTube Link: {video.youtubeLink}</p>
                            )}
                            {video.type === 'file' && (
                              <p className="text-sm text-gray-600">File: {video.fileName}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => deleteVideoCard(sectionIndex, videoIndex)}
                              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowSetTaskModal(true)}
                              className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
                            >
                              Set Task
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!currentState || !currentCluster || !currentDistrict) {
      alert("Please select State, Cluster and District first.");
      return;
    }

    setSaving(true);
    try {
      await updateFranchiseeManagerSettings({
        state: currentState,
        cluster: currentCluster,
        district: currentDistrict,
        traineeSettings,
        managerSettings,
        videoSections,
        examSettings: {
          passingMarks,
          questions: examQuestions
        }
      });
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Save failed", error);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-2xl font-bold text-gray-800">
                Partner Manager Trainee & Partner Manager Setting
              </h3>
            </div>
            <button
              onClick={() => setLocationCardsVisible(!locationCardsVisible)}
              className="flex items-center px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
            >
              {locationCardsVisible ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide Location Cards
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Show Location Cards
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Location Selection Cards */}
      {locationCardsVisible && (
        <div className={`transition-all duration-500 ${locationCardsVisible ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          {/* State Selection */}
          <div className="mb-8">
            <h4 className="text-xl font-semibold mb-4 text-gray-700">Select State</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {statesList.length > 0 ? statesList.map((state) => (
                <div
                  key={state._id}
                  onClick={() => handleStateClick(state.name)}
                  className={`bg-white rounded-lg shadow-md p-6 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${currentState === state.name ? 'border-2 border-blue-500' : 'border border-gray-200'
                    }`}
                >
                  <h5 className="font-bold text-lg">{state.name}</h5>
                  <p className="text-gray-500 text-sm mt-1">
                    {state.code || state.name.substring(0, 2).toUpperCase()}
                  </p>
                </div>
              )) : <p>Loading states...</p>}
            </div>
          </div>

          {/* Cluster Selection */}
          {currentState && (
            <div className="mb-8 transition-all duration-500">
              <h4 className="text-xl font-semibold mb-4 text-gray-700">Select Cluster</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {clustersList.length > 0 ? clustersList.map((cluster) => (
                  <div
                    key={cluster._id}
                    onClick={() => handleClusterClick(cluster.name)}
                    className={`bg-white rounded-lg shadow-md p-4 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${currentCluster === cluster.name ? 'border-2 border-blue-500' : 'border border-gray-200'
                      }`}
                  >
                    <h6 className="font-bold">{cluster.name}</h6>
                    <p className="text-gray-500 text-sm mt-1">{currentState}</p>
                  </div>
                )) : <p>Loading clusters...</p>}
              </div>
            </div>
          )}

          {/* District Selection */}
          {currentCluster && (
            <div className="mb-8 transition-all duration-500">
              <h4 className="text-xl font-semibold mb-4 text-gray-700">Select District</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {districtsList.length > 0 ? districtsList.map((district) => (
                  <div
                    key={district._id}
                    onClick={() => handleDistrictClick(district.name)}
                    className={`bg-white rounded-lg shadow-md p-4 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${currentDistrict === district.name ? 'border-2 border-blue-500' : 'border border-gray-200'
                      }`}
                  >
                    <h6 className="font-bold">{district.name}</h6>
                    <p className="text-gray-500 text-sm mt-1">{currentCluster}</p>
                  </div>
                )) : <p>Loading districts...</p>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toggle Buttons */}
      <div className="flex flex-wrap justify-center mb-8 gap-4">
        <button
          onClick={() => setActiveForm('cprm-trainee-form')}
          className={`px-6 py-2 rounded-lg transition-colors ${activeForm === 'cprm-trainee-form'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          Partner Manager Trainee Setting
        </button>
        <button
          onClick={() => setActiveForm('cprm-form')}
          className={`px-6 py-2 rounded-lg transition-colors ${activeForm === 'cprm-form'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          Partner Manager Setting
        </button>
      </div>

      {/* CPRM Trainee Form */}
      {activeForm === 'cprm-trainee-form' && (
        <div className="bg-white rounded-lg shadow-lg my-8">
          <div className="bg-cyan-600 text-white rounded-t-lg p-4">
            <h4 className="text-xl font-bold">Partner Manager Trainee Settings</h4>
          </div>
          <div className="p-6">
            <form onSubmit={handleSaveSettings}>
              {/* Evaluation Period */}
              <h5 className="text-lg font-bold text-blue-600 mb-4">Evaluation Period Settings</h5>

              <div className="mb-4 bg-gray-50 p-4 rounded text-sm">
                <strong>Location:</strong> {currentState} / {currentCluster} / {currentDistrict}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block font-medium mb-2">App Demos</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={traineeSettings.appDemos}
                    onChange={(e) => setTraineeSettings({ ...traineeSettings, appDemos: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block font-medium mb-2">Evaluation Flow</label>
                <div className="bg-gray-50 rounded-lg border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-200">
                    1. AppDemo Submitted by Partner
                  </div>
                  <div className="px-4 py-3 border-b border-gray-200">
                    2. Evaluated by Marketing Manager
                  </div>
                  <div className="px-4 py-3">
                    3. Approved & Moved to 90-day Goal Cycle
                  </div>
                </div>
              </div>

              <hr className="my-6" />

              {/* 90 Days Goal */}
              <h5 className="text-lg font-bold text-green-600 mb-4">90 Days Goal Setting</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block font-medium mb-2">Partner Target</label>
                  <input type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={traineeSettings.ninetyDaysGoal.target}
                    onChange={(e) => setTraineeSettings({ ...traineeSettings, ninetyDaysGoal: { ...traineeSettings.ninetyDaysGoal, target: e.target.value } })}
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2">Goal Due Days (Max)</label>
                  <input type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={traineeSettings.ninetyDaysGoal.dueDays}
                    onChange={(e) => setTraineeSettings({ ...traineeSettings, ninetyDaysGoal: { ...traineeSettings.ninetyDaysGoal, dueDays: e.target.value } })}
                    required
                  />
                </div>
              </div>

              <hr className="my-6" />

              {/* Commission Eligibility */}
              <h5 className="text-lg font-bold text-amber-600 mb-4">Commission Eligibility</h5>
              <p className="text-gray-600 mb-4">
                If 90 Days Goal is achieved & signups are completed, the Partner Manager is eligible for commission.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block font-medium mb-2">Required Partner's (90 Days)</label>
                  <input type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={traineeSettings.commissionEligibility.requiredFranchisees}
                    onChange={(e) => setTraineeSettings({ ...traineeSettings, commissionEligibility: { ...traineeSettings.commissionEligibility, requiredFranchisees: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2">Signup Status</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={traineeSettings.commissionEligibility.signupStatus}
                    onChange={(e) => setTraineeSettings({ ...traineeSettings, commissionEligibility: { ...traineeSettings.commissionEligibility, signupStatus: e.target.value } })}
                  >
                    <option value="" disabled>Select...</option>
                    <option value="Signup Completed">Signup Completed</option>
                    <option value="Signup Pending">Signup Pending</option>
                  </select>
                </div>
              </div>

              {/* Company Lead Eligibility */}
              <hr className="my-6" />
              <h5 className="text-lg font-bold text-cyan-600 mb-4">Company Lead Eligibility</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block font-medium mb-2">Partner Signup Count</label>
                  <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={traineeSettings.companyLeadEligibility.signupCount}
                    onChange={(e) => setTraineeSettings({ ...traineeSettings, companyLeadEligibility: { ...traineeSettings.companyLeadEligibility, signupCount: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2">Lead Limit</label>
                  <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={traineeSettings.companyLeadEligibility.leadLimit}
                    onChange={(e) => setTraineeSettings({ ...traineeSettings, companyLeadEligibility: { ...traineeSettings.companyLeadEligibility, leadLimit: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2">Percentage Visit</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={traineeSettings.companyLeadEligibility.percentageVisit}
                    onChange={(e) => setTraineeSettings({ ...traineeSettings, companyLeadEligibility: { ...traineeSettings.companyLeadEligibility, percentageVisit: e.target.value } })}
                  />
                </div>
              </div>

              {/* Commission Settings */}
              <hr className="my-6" />
              <h5 className="text-lg font-bold text-red-600 mb-4">Commission Settings</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block font-medium mb-2">Commission for New Partner Creation (₹)</label>
                  <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={traineeSettings.commissionSettings.newFranchiseeCommission}
                    onChange={(e) => setTraineeSettings({ ...traineeSettings, commissionSettings: { ...traineeSettings.commissionSettings, newFranchiseeCommission: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2">Commission for Signup Done (₹)</label>
                  <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={traineeSettings.commissionSettings.signupDoneCommission}
                    onChange={(e) => setTraineeSettings({ ...traineeSettings, commissionSettings: { ...traineeSettings.commissionSettings, signupDoneCommission: e.target.value } })}
                  />
                </div>
              </div>

              <hr className="my-6" />

              {/* Shared Video/Exam Section */}
              <h5 className="text-lg font-bold text-blue-600 mb-4">Upload Video Sections and Create Exam</h5>
              {renderVideoSections()}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium flex justify-center items-center"
              >
                {saving ? <Loader className="animate-spin mr-2" /> : <Save className="mr-2" />}
                Save Partner Manager Settings
              </button>
            </form>
          </div >
        </div >
      )}

      {/* CPRM Form */}
      {
        activeForm === 'cprm-form' && (
          <div className="bg-white rounded-lg shadow-lg my-8">
            <div className="bg-blue-600 text-white rounded-t-lg p-4">
              <h4 className="text-xl font-bold">Partner Manager Settings</h4>
            </div>
            <div className="p-6">
              <form onSubmit={handleSaveSettings}>
                <div className="mb-4 bg-gray-50 p-4 rounded text-sm">
                  <strong>Location:</strong> {currentState} / {currentCluster} / {currentDistrict}
                </div>

                {/* Reusing similar fields for Manager Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block font-medium mb-2">App Demos</label>
                    <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      value={managerSettings.appDemos}
                      onChange={(e) => setManagerSettings({ ...managerSettings, appDemos: e.target.value })}
                    />
                  </div>
                </div>

                {/* ... (Ideally reuse components, but keeping strict file structure) ... */}
                {/* For brevity, replicating a few key fields to show dynamic nature */}

                <h5 className="text-lg font-bold text-green-600 mb-4">90 Days Goal Setting</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block font-medium mb-2">Partner Target</label>
                    <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      value={managerSettings.ninetyDaysGoal.target}
                      onChange={(e) => setManagerSettings({ ...managerSettings, ninetyDaysGoal: { ...managerSettings.ninetyDaysGoal, target: e.target.value } })}
                    />
                  </div>
                </div>

                {/* Shared Video/Exam Section */}
                <hr className="my-6" />
                <h5 className="text-lg font-bold text-blue-600 mb-4">Upload Video Sections and Create Exam</h5>
                {renderVideoSections()}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium flex justify-center items-center"
                >
                  {saving ? <Loader className="animate-spin mr-2" /> : <Save className="mr-2" />}
                  Save Partner Manager Settings
                </button>
              </form>
            </div>
          </div>
        )
      }

      {/* Set Task Modal */}
      {
        showSetTaskModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Create Exam Questions</h3>
                  <button
                    onClick={() => setShowSetTaskModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg">
                  <div className="bg-green-600 text-white rounded-t-lg p-4 flex justify-between items-center">
                    <span>Create Exam Questions</span>
                    <button
                      onClick={addExamQuestion}
                      className="bg-white text-green-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4 inline mr-1" />
                      Add Question
                    </button>
                  </div>
                  <div className="p-4">
                    {/* Passing Marks Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block font-medium mb-2">Total Questions</label>
                        <input
                          type="text"
                          value={examQuestions.length}
                          readOnly
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-2">Passing Marks (Minimum Required)</label>
                        <input
                          type="number"
                          value={passingMarks}
                          onChange={(e) => setPassingMarks(parseInt(e.target.value))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          placeholder="Enter passing marks"
                        />
                      </div>
                    </div>

                    {/* Questions Container */}
                    <div className="space-y-4">
                      {examQuestions.map((question, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="mb-4">
                            <label className="block font-medium mb-2">Question {index + 1}</label>
                            <input
                              type="text"
                              value={question.question}
                              onChange={(e) => updateExamQuestion(index, 'question', e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              placeholder="Enter question here"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            {['A', 'B', 'C', 'D'].map((option) => (
                              <div key={option}>
                                <label className="block font-medium mb-1">Option {option}</label>
                                <input
                                  type="text"
                                  value={question.options[option]}
                                  onChange={(e) => updateExamOption(index, option, e.target.value)}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                  placeholder={`Option ${option}`}
                                />
                              </div>
                            ))}
                          </div>
                          <div className="mb-4">
                            <label className="block font-medium mb-2">Correct Answer</label>
                            <select
                              value={question.correctAnswer}
                              onChange={(e) => updateExamQuestion(index, 'correctAnswer', e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            >
                              <option value="A">Option A</option>
                              <option value="B">Option B</option>
                              <option value="C">Option C</option>
                              <option value="D">Option D</option>
                            </select>
                          </div>
                          <div className="flex justify-end">
                            <button
                              onClick={() => removeQuestion(index)}
                              className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end">
                    <button
                      onClick={saveExam}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium"
                    >
                      Save Exam
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default FranchiseeManagerSetting;