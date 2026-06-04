import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Pencil,
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
  Loader,
  Globe,
  MapPin,
  LayoutGrid,
  Search,
  Users,
  Clock,
  Calendar
} from 'lucide-react';
import { useLocations } from '../../../../hooks/useLocations';
import { fetchFranchiseeManagerSettings, updateFranchiseeManagerSettings } from '../../../../services/settings/settingsApi';
import toast from 'react-hot-toast';

const FranchiseeManagerSetting = () => {
  // Location Selection Hooks
  const {
    countries, selectedCountry, setSelectedCountry,
    states, selectedState, setSelectedState,
    districts, selectedDistrict, setSelectedDistrict,
    clusters, selectedCluster, setSelectedCluster
  } = useLocations();

  // State management
  const [locationCardsVisible, setLocationCardsVisible] = useState(true);
  const [activeLocationTab, setActiveLocationTab] = useState('State');
  
  // Multiselect Selections (Stored as Names for backend compatibility)
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedClusters, setSelectedClusters] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [activeForm, setActiveForm] = useState('cprm-trainee-form');
  const [showSetTaskModal, setShowSetTaskModal] = useState(false);

  // Settings Data
  const [traineeSettings, setTraineeSettings] = useState({
    appDemos: 10,
    evaluationFlow: '', 
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

  // Default Country selection
  useEffect(() => {
    if (!selectedCountry && countries.length > 0) {
      setSelectedCountry(countries[0]._id);
    }
  }, [countries, selectedCountry, setSelectedCountry]);

  // Fetch Settings when specific location selected (for loading existing values)
  useEffect(() => {
    const loadSettings = async () => {
      if (selectedState && selectedCluster && selectedDistrict) {
        setLoading(true);
        try {
          const stateName = states.find(s => s._id === selectedState)?.name;
          const clusterName = clusters.find(c => c._id === selectedCluster)?.name;
          const districtName = districts.find(d => d._id === selectedDistrict)?.name;

          if (stateName && clusterName && districtName) {
            const data = await fetchFranchiseeManagerSettings({
              state: stateName,
              cluster: clusterName,
              district: districtName
            });

            if (data) {
              if (data.traineeSettings) setTraineeSettings(prev => ({ ...prev, ...data.traineeSettings }));
              if (data.managerSettings) setManagerSettings(prev => ({ ...prev, ...data.managerSettings }));
              if (data.videoSections && data.videoSections.length > 0) setVideoSections(data.videoSections);
              if (data.examSettings) {
                setExamQuestions(data.examSettings.questions || []);
                setPassingMarks(data.examSettings.passingMarks || 1);
              }
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
  }, [selectedState, selectedCluster, selectedDistrict, states, clusters, districts]);

  // Multiselect Helpers
  const toggleSelection = (list, setList, val) => {
    setList(prev => prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val]);
  };

  const selectAll = (list, setList) => {
    setList(list.map(i => i.name));
  };

  const clearAll = (setList) => {
    setList([]);
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
      toast.error('Please enter at least a section name, video file, or YouTube link');
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
    } else {
      toast.error("You must have at least one question in the exam.");
    }
  };

  const saveExam = () => {
    if (!passingMarks || passingMarks < 1 || passingMarks > examQuestions.length) {
      toast.error(`Please enter valid passing marks between 1 and ${examQuestions.length}`);
      return;
    }

    const allValid = examQuestions.every((q) => {
      return q.question && q.options.A && q.options.B && q.options.C && q.options.D && q.correctAnswer;
    });

    if (!allValid) {
      toast.error('Please complete all fields for all questions');
      return;
    }

    toast.success('Exam structure validated successfully!');
    setShowSetTaskModal(false);
  };

  const renderVideoSections = () => (
    <div className="mb-10">
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <span className="font-bold text-lg flex items-center gap-3">
             Video Upload Sections
          </span>
          <button
            type="button"
            onClick={addVideoSection}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all border border-white/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Section
          </button>
        </div>
        
        <div className="p-6 space-y-6 bg-gray-50/30">
          {videoSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm transition-all hover:shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700">Category</label>
                  <select
                    value={section.category}
                    onChange={(e) => updateVideoSection(sectionIndex, 'category', e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="solarrooftop">Solar Rooftop</option>
                    <option value="solarpump">Solar Pump</option>
                    <option value="solarstreatlight">Solar Street Light</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700">Section Name</label>
                  <input
                    type="text"
                    value={section.name}
                    onChange={(e) => updateVideoSection(sectionIndex, 'name', e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Enter Section Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700">Upload Video</label>
                  <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                          <input
                            type="file"
                            accept="video/*"
                            id={`file-${sectionIndex}`}
                            onChange={(e) => updateVideoSection(sectionIndex, 'videoFile', e.target.files[0])}
                            className="hidden"
                          />
                          <label 
                            htmlFor={`file-${sectionIndex}`}
                            className="flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-2.5 bg-white cursor-pointer hover:bg-gray-50 transition-all text-sm"
                          >
                            <Upload className="w-4 h-4 text-blue-600" />
                            <span className="truncate">{section.videoFile ? section.videoFile.name : 'Choose File'}</span>
                          </label>
                      </div>
                      <span className="text-xs text-gray-400 font-medium shrink-0">No file chosen</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700">Or YouTube Link</label>
                  <div className="flex items-center relative">
                    <Youtube className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500" />
                    <input
                      type="url"
                      value={section.youtubeLink || ''}
                      onChange={(e) => updateVideoSection(sectionIndex, 'youtubeLink', e.target.value)}
                      className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="https://youtube.com/xyz"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => addVideoToSection(sectionIndex)}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 flex items-center gap-2 transition-all font-bold shadow-lg shadow-blue-100"
                >
                  <Plus className="w-4 h-4" /> Add Video
                </button>
              </div>

              {section.videos.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h6 className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-4">Videos in this section</h6>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {section.videos.map((video, videoIndex) => (
                      <div key={video.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 group relative hover:border-blue-200 transition-all">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h6 className="font-bold text-gray-800 text-sm truncate pr-2">{video.name}</h6>
                            <p className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-2 bg-white w-fit px-2 py-0.5 rounded-lg border border-gray-100">
                                {video.type === 'youtube' ? <Youtube className="w-3.5 h-3.5 text-red-500" /> : <Video className="w-3.5 h-3.5 text-blue-500" />}
                                <span className="truncate">{video.type === 'file' ? video.fileName : 'YouTube'}</span>
                            </p>
                          </div>
                          <div className="flex gap-1.5 ml-2">
                            <button
                              type="button"
                              onClick={() => deleteVideoCard(sectionIndex, videoIndex)}
                              className="text-gray-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowSetTaskModal(true)}
                              className="bg-green-500 text-white p-2 rounded-xl hover:bg-green-600 transition-all shadow-md"
                            >
                              <Check className="w-4 h-4" />
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
    if (selectedStates.length === 0 || selectedDistricts.length === 0) {
      toast.error("Please select at least one State and District.");
      return;
    }

    setSaving(true);
    try {
      await updateFranchiseeManagerSettings({
        state: selectedStates,
        cluster: selectedClusters.length > 0 ? selectedClusters : ['Default'], // Handle cases where clusters might not be selected
        district: selectedDistricts,
        traineeSettings,
        managerSettings,
        videoSections,
        examSettings: {
          passingMarks,
          questions: examQuestions
        }
      });
      toast.success("Settings applied successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-200">
              <LayoutGrid className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Partner Manager Settings</h1>
              <p className="text-gray-500 text-sm font-medium">Configure trainees, goals, and training materials</p>
            </div>
          </div>
          <button
            onClick={() => setLocationCardsVisible(!locationCardsVisible)}
            className="flex items-center px-5 py-2.5 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all active:scale-95 shadow-sm"
          >
            {locationCardsVisible ? (
              <><EyeOff className="w-5 h-5 mr-2" /> Hide Location Cards</>
            ) : (
              <><Eye className="w-5 h-5 mr-2" /> Show Location Cards</>
            )}
          </button>
        </div>
      </div>

      {/* Cascading Location Selection */}
      {locationCardsVisible && (
        <div className="space-y-8 mb-10 transition-all animate-in slide-in-from-top-4 duration-500">
          
          {/* 1. Country Selection */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" /> Select Country
              </h4>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search Country..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {countries.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map(c => (
                <button
                  key={c._id}
                  onClick={() => setSelectedCountry(c._id)}
                  className={`p-3 rounded-xl border-2 transition-all relative text-left group ${selectedCountry === c._id ? 'border-blue-600 bg-blue-50 shadow-sm shadow-blue-100' : 'border-gray-100 bg-white hover:border-blue-200'}`}
                >
                  <div className="flex justify-between items-start mb-0.5">
                      <span className={`font-bold text-sm truncate ${selectedCountry === c._id ? 'text-blue-700' : 'text-gray-800'}`}>{c.name}</span>
                      <span className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold ${selectedCountry === c._id ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>0</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{c.code || 'IN'}</span>
                  {selectedCountry === c._id && <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-lg p-0.5 shadow-lg"><Check className="w-2.5 h-2.5 text-white" /></div>}
                </button>
              ))}
            </div>
          </div>

          {/* 2. State Selection (Cascading) */}
          {selectedCountry && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" /> Select State
                </h4>
                <div className="flex gap-2">
                    <button type="button" onClick={() => selectAll(states, setSelectedStates)} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">Select All</button>
                    <button type="button" onClick={() => clearAll(setSelectedStates)} className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">Clear</button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {states.map(s => {
                    const isSelected = selectedStates.includes(s.name);
                    return (
                        <button
                            key={s._id}
                            type="button"
                            onClick={() => {
                                toggleSelection(selectedStates, setSelectedStates, s.name);
                                setSelectedState(s._id);
                            }}
                            className={`p-3 rounded-xl border-2 transition-all relative text-left group ${isSelected ? 'border-blue-600 bg-blue-50 shadow-sm shadow-blue-100' : 'border-gray-100 bg-white hover:border-blue-200'}`}
                        >
                            <div className="flex justify-between items-start mb-0.5">
                                <span className={`font-bold text-sm truncate ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>{s.name}</span>
                                <span className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold ${isSelected ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>0</span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.code || s.name.substring(0, 2).toUpperCase()}</span>
                            {isSelected && <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-lg p-0.5 shadow-lg"><Check className="w-2.5 h-2.5 text-white" /></div>}
                        </button>
                    );
                })}
              </div>
            </div>
          )}

          {/* 3. District Selection (Cascading) */}
          {selectedState && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-orange-600" /> Select District
                </h4>
                <div className="flex gap-2">
                    <button type="button" onClick={() => selectAll(districts, setSelectedDistricts)} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">Select All</button>
                    <button type="button" onClick={() => clearAll(setSelectedDistricts)} className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">Clear</button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {districts.map(d => {
                    const isSelected = selectedDistricts.includes(d.name);
                    return (
                        <button
                            key={d._id}
                            type="button"
                            onClick={() => {
                                toggleSelection(selectedDistricts, setSelectedDistricts, d.name);
                                setSelectedDistrict(d._id);
                            }}
                            className={`p-3 rounded-xl border-2 transition-all relative text-left group ${isSelected ? 'border-blue-600 bg-blue-50 shadow-sm shadow-blue-100' : 'border-gray-100 bg-white hover:border-blue-200'}`}
                        >
                            <div className="flex justify-between items-start mb-0.5">
                                <span className={`font-bold text-sm truncate ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>{d.name}</span>
                                <span className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold ${isSelected ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>0</span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{d.name.substring(0, 3).toUpperCase()}</span>
                            {isSelected && <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-lg p-0.5 shadow-lg"><Check className="w-2.5 h-2.5 text-white" /></div>}
                        </button>
                    );
                })}
              </div>
            </div>
          )}

          {/* 4. Cluster Selection (Cascading) */}
          {selectedDistrict && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-purple-600" /> Select Cluster
                </h4>
                <div className="flex gap-2">
                    <button type="button" onClick={() => selectAll(clusters, setSelectedClusters)} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">Select All</button>
                    <button type="button" onClick={() => clearAll(setSelectedClusters)} className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">Clear</button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {clusters.map(cl => {
                    const isSelected = selectedClusters.includes(cl.name);
                    return (
                        <button
                            key={cl._id}
                            type="button"
                            onClick={() => {
                                toggleSelection(selectedClusters, setSelectedClusters, cl.name);
                                setSelectedCluster(cl._id);
                            }}
                            className={`p-3 rounded-xl border-2 transition-all relative text-left group ${isSelected ? 'border-blue-600 bg-blue-50 shadow-sm shadow-blue-100' : 'border-gray-100 bg-white hover:border-blue-200'}`}
                        >
                            <div className="flex justify-between items-start mb-0.5">
                                <span className={`font-bold text-sm truncate ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>{cl.name}</span>
                                <span className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold ${isSelected ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>0</span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{cl.name.substring(0, 3).toUpperCase()}</span>
                            {isSelected && <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-lg p-0.5 shadow-lg"><Check className="w-2.5 h-2.5 text-white" /></div>}
                        </button>
                    );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Settings Form */}
      <div className="max-w-6xl mx-auto">
          {/* Toggle Buttons */}
          <div className="flex justify-center mb-8 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-fit mx-auto">
            <button
              onClick={() => setActiveForm('cprm-trainee-form')}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${activeForm === 'cprm-trainee-form' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Partner Manager Trainee Setting
            </button>
            <button
              onClick={() => setActiveForm('cprm-form')}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${activeForm === 'cprm-form' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Partner Manager Setting
            </button>
          </div>

          <form onSubmit={handleSaveSettings}>
            <div className="space-y-8">
                {activeForm === 'cprm-trainee-form' ? (
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-6">
                      <h4 className="text-xl font-bold flex items-center gap-2 uppercase tracking-wide">
                        <Users className="w-6 h-6" /> Partner Manager Trainee Settings
                      </h4>
                    </div>
                    <div className="p-8">
                        <div className="pt-4">
                            {renderVideoSections()}
                        </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-blue-600 text-white p-6">
                      <h4 className="text-xl font-bold flex items-center gap-2 uppercase tracking-wide">
                        <Users className="w-6 h-6" /> Partner Manager Settings
                      </h4>
                    </div>
                    <div className="p-8">
                        <div className="pt-4">
                            {renderVideoSections()}
                        </div>
                    </div>
                  </div>
                )}

                {/* Bulk Save Button */}
                <div className="flex justify-center mt-12 pb-10">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 text-white w-full max-w-4xl py-4 rounded-2xl hover:bg-blue-700 font-bold flex items-center justify-center shadow-xl shadow-blue-100 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 gap-3"
                    >
                        {saving ? <Loader className="animate-spin w-6 h-6" /> : <Save className="w-6 h-6" />}
                        Save Partner Manager Settings
                    </button>
                </div>
            </div>
          </form>

          {/* Saved Settings Table - Matching Onboarding Goals Pattern */}
          <div className="mt-16 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-20">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h4 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <LayoutGrid className="w-6 h-6 text-blue-600" /> Existing Location Settings
                </h4>
                <div className="text-sm font-medium text-gray-500">Showing saved configurations across regions</div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4 text-left">Location</th>
                            <th className="px-6 py-4 text-left">Trainee Goal</th>
                            <th className="px-6 py-4 text-left">Manager Goal</th>
                            <th className="px-6 py-4 text-left">Videos</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {/* Static list for UI demo, real logic would fetch all from backend */}
                        {[
                            { state: 'Gujarat', district: 'Ahmedabad', cluster: 'North', traineeTarget: 30, managerTarget: 50, videoCount: 5 },
                            { state: 'Maharashtra', district: 'Mumbai', cluster: 'South', traineeTarget: 25, managerTarget: 40, videoCount: 3 },
                        ].map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-800">{item.district}</div>
                                    <div className="text-xs text-gray-500">{item.state} / {item.cluster}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-100">{item.traineeTarget} Partners</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">{item.managerTarget} Partners</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                                        <Video className="w-4 h-4" /> {item.videoCount} Sections
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center gap-2">
                                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Edit"><Pencil className="w-5 h-5" /></button>
                                        <button className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Delete"><Trash2 className="w-5 h-5" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
      </div>

      {/* Assessment Modal */}
      {showSetTaskModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-600 text-white p-6 sticky top-0 z-10 flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-2"><LayoutGrid className="w-6 h-6" /> Create Assessment</h3>
                <button onClick={() => setShowSetTaskModal(false)} className="bg-white/20 hover:bg-white/30 p-2 rounded-xl"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-8">
                <div className="space-y-8">
                    {examQuestions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-gray-50 rounded-3xl p-6 relative border border-gray-200">
                            <button onClick={() => removeQuestion(qIndex)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-600 mb-2">Question {qIndex + 1}</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    placeholder="Enter question text..."
                                    value={q.question}
                                    onChange={(e) => updateExamQuestion(qIndex, 'question', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {['A', 'B', 'C', 'D'].map(opt => (
                                    <div key={opt} className="flex items-center gap-3">
                                        <span className="font-bold text-gray-400 w-6 text-center">{opt}.</span>
                                        <input 
                                            type="text" 
                                            className={`flex-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white ${q.correctAnswer === opt ? 'border-green-500 ring-1 ring-green-100' : 'border-gray-200'}`}
                                            value={q.options[opt]}
                                            onChange={(e) => updateExamOption(qIndex, opt, e.target.value)}
                                            placeholder={`Option ${opt}`}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-gray-700">Correct Answer:</span>
                                <div className="flex gap-2">
                                    {['A', 'B', 'C', 'D'].map(opt => (
                                        <button 
                                            key={opt}
                                            onClick={() => updateExamQuestion(qIndex, 'correctAnswer', opt)}
                                            className={`w-10 h-10 rounded-xl font-bold transition-all ${q.correctAnswer === opt ? 'bg-green-600 text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-400 hover:bg-gray-50'}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex justify-between items-center">
                    <button onClick={addExamQuestion} className="flex items-center gap-2 font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all"><Plus className="w-5 h-5" /> Add Question</button>
                    <button onClick={saveExam} className="bg-green-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-green-100 hover:bg-green-700 transition-all">Finalize Assessment</button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FranchiseeManagerSetting;