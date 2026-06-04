import React, { useState, useEffect } from 'react';
import {
  FileText, Settings, MapPin, Building, Users,
  Plus, X, Save, ArrowLeft, CheckCircle,
  Trash2, Clock, Percent, ListChecks, Edit, Loader, GraduationCap, ChevronLeft
} from 'lucide-react';
import { getCountries, getStates, getClusters, getDistricts, getCities } from '../../../../services/core/locationApi';
import { getDepartments } from '../../../../services/core/masterApi';
import { getCandidateTests, createCandidateTest, deleteCandidateTest, updateCandidateTest } from '../../../../services/hrms/hrmsApi';
import toast from 'react-hot-toast';

const CandidateTestSetting = () => {
  // Data States
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [tests, setTests] = useState([]);

  // Selection States
  const [currentStep, setCurrentStep] = useState('country');
  const [currentCountry, setCurrentCountry] = useState(null);
  const [currentState, setCurrentState] = useState(null);
  const [currentCluster, setCurrentCluster] = useState(null);
  const [currentDistrict, setCurrentDistrict] = useState(null);
  const [selectedCities, setSelectedCities] = useState([]);
  const [currentDepartment, setCurrentDepartment] = useState(null);

  const [showTestForm, setShowTestForm] = useState(false);
  const [editingTestId, setEditingTestId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Test form states
  const [testConfig, setTestConfig] = useState({
    name: '',
    duration: 60,
    totalQuestions: 30,
    passingPercentage: 60,
    negativeMarking: false,
    negativeMarkValue: 0.25
  });

  // Questions state
  const [questions, setQuestions] = useState([
    {
      id: Date.now(),
      text: '',
      type: 'Multiple Choice',
      options: ['', '', '', ''],
      correctAnswer: [],
      marks: 1
    }
  ]);

  // Initial Data Load
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


  // Fetch Tests when Department Selected
  useEffect(() => {
    if (currentDepartment?._id) {
      fetchTests();
      if (currentStep === 'department') {
        setCurrentStep('tests');
      }
      setShowTestForm(false);
      setEditingTestId(null);
    }
  }, [currentDepartment]);

  const fetchTests = async () => {
    if (!currentDepartment?._id) return;
    try {
      const params = { department: currentDepartment._id };
      if (currentCountry?._id) params.country = currentCountry._id;
      if (currentState?._id) params.state = currentState._id;
      if (currentCluster?._id) params.cluster = currentCluster._id;
      if (currentDistrict?._id) params.district = currentDistrict._id;

      const response = await getCandidateTests(params);
      setTests(response.data || []);
    } catch (error) {
      console.error("Error fetching tests:", error);
      toast.error("Failed to load tests");
    }
  };

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
    setCurrentStep('tests');
  };

  const handleDeleteTest = async (e, testId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this test?")) {
      try {
        await deleteCandidateTest(testId);
        toast.success("Test deleted");
        fetchTests();
      } catch (error) {
        console.error("Error deleting test:", error);
        toast.error("Failed to delete test");
      }
    }
  };

  const handleEditTest = (test) => {
    setEditingTestId(test._id);

    // Pre-populate testConfig
    setTestConfig({
      name: test.name,
      duration: test.duration,
      totalQuestions: test.totalQuestions || test.questions?.length || 30,
      passingPercentage: test.passingPercentage,
      negativeMarking: test.negativeMarking || false,
      negativeMarkValue: test.negativeMarkValue || 0.25
    });

    // Formatting questions for the state
    if (test.questions && test.questions.length > 0) {
      const formattedQuestions = test.questions.map((q, idx) => ({
        id: Date.now() + idx, // unique id string
        text: q.text,
        type: q.type === 'multiple' ? 'Multiple Choice' : 'Single Choice',
        options: q.options || [],
        correctAnswer: q.correctAnswer.map(ans => parseInt(ans, 10)),
        marks: q.marks || 1
      }));
      setQuestions(formattedQuestions);
    } else {
      setQuestions([{ id: Date.now(), text: '', type: 'Multiple Choice', options: ['', '', '', ''], correctAnswer: [], marks: 1 }]);
    }

    setShowTestForm(true);
  };

  const handleAddNewTestClick = () => {
    setEditingTestId(null);
    setTestConfig({ name: '', duration: 60, totalQuestions: 30, passingPercentage: 60, negativeMarking: false, negativeMarkValue: 0.25 });
    setQuestions([{ id: Date.now(), text: '', type: 'Multiple Choice', options: ['', '', '', ''], correctAnswer: [], marks: 1 }]);
    setShowTestForm(true);
  };

  // --- FORM HANDLERS ---
  const addNewQuestion = () => {
    setQuestions([...questions, {
      id: Date.now(),
      text: '',
      type: 'Multiple Choice',
      options: ['', '', '', ''],
      correctAnswer: [],
      marks: 1
    }]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    if (field === 'text' || field === 'type' || field === 'marks') {
      newQuestions[index][field] = value;
    } else if (field === 'option') {
      newQuestions[index].options[value.optionIndex] = value.optionValue;
    } else if (field === 'correctAnswer') {
      if (newQuestions[index].type === 'Single Choice') {
        newQuestions[index].correctAnswer = [value];
      } else {
        const current = newQuestions[index].correctAnswer;
        if (current.includes(value)) {
          newQuestions[index].correctAnswer = current.filter(v => v !== value);
        } else {
          newQuestions[index].correctAnswer = [...current, value];
        }
      }
    }
    setQuestions(newQuestions);
  };

  const addOption = (questionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push('');
    setQuestions(newQuestions);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.splice(optionIndex, 1);
    const newAnswers = newQuestions[questionIndex].correctAnswer
      .filter(a => a !== optionIndex)
      .map(a => a > optionIndex ? a - 1 : a);
    newQuestions[questionIndex].correctAnswer = newAnswers;
    setQuestions(newQuestions);
  };

  const saveTestSettings = async () => {
    if (!testConfig.name.trim()) return toast.error('Enter test name');
    if (questions.length === 0) return toast.error('Add at least one question');
    if (!currentCountry || !currentState || !currentCluster || !currentDistrict || selectedCities.length === 0) {
      return toast.error('Please select Country, State, Cluster, District, and Cities');
    }

    const validQuestions = questions.filter(q => q.text.trim() !== '');
    if (validQuestions.length === 0) return toast.error('Questions cannot be empty');

    const formattedQuestions = validQuestions.map(q => ({
      text: q.text,
      type: q.type === 'Multiple Choice' ? 'multiple' : 'single',
      options: q.options,
      correctAnswer: q.correctAnswer.map(String),
      marks: q.marks
    }));

    const payload = {
      ...testConfig,
      department: currentDepartment._id,
      country: currentCountry._id,
      state: currentState._id,
      cluster: currentCluster._id,
      district: currentDistrict._id,
      cities: selectedCities.map(c => c._id),
      questions: formattedQuestions
    };

    try {
      setIsSaving(true);
      if (editingTestId) {
        await updateCandidateTest(editingTestId, payload);
        toast.success("Test updated successfully");
      } else {
        await createCandidateTest(payload);
        toast.success("Test created successfully");
      }
      setShowTestForm(false);
      setEditingTestId(null);
      setCurrentStep('tests');
      fetchTests();
      setTestConfig({ name: '', duration: 60, totalQuestions: 30, passingPercentage: 60, negativeMarking: false, negativeMarkValue: 0.25 });
      setQuestions([{ id: Date.now(), text: '', type: 'Multiple Choice', options: ['', '', '', ''], correctAnswer: [], marks: 1 }]);
    } catch (error) {
      console.error("Error saving test:", error);
      const errorMsg = error.message || (typeof error === 'string' ? error : "Failed to save test");
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg p-4 shadow-lg">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-white mr-3" />
            <h1 className="text-2xl font-bold text-white">Candidate Test Settings</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto">
        {isLoading && (
          <div className="flex justify-center p-8">
            <Loader className="animate-spin text-blue-600 h-8 w-8" />
          </div>
        )}

        {/* Country Selection */}
        {currentStep === 'country' && !isLoading && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-blue-900 border-b-2 border-gray-200 pb-3 mb-6">Select Country</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {countries.map((country) => (
                <div
                  key={country._id}
                  className={`bg-white rounded-lg shadow-md p-6 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${currentCountry?._id === country._id ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' : ''}`}
                  onClick={() => handleCountrySelect(country)}
                >
                  <h3 className="font-medium">{country.name}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* State Selection */}
        {currentStep === 'state' && currentCountry && (
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <button onClick={() => setCurrentStep('country')} className="mr-4 p-2 rounded-lg hover:bg-gray-100"><ChevronLeft className="h-5 w-5" /></button>
              <h2 className="text-xl font-semibold">Select State in <span className="text-blue-600">{currentCountry.name}</span></h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {states.map((state) => (
                <div
                  key={state._id}
                  className={`bg-white rounded-lg shadow-md p-6 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${currentState?._id === state._id ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' : ''}`}
                  onClick={() => handleStateSelect(state)}
                >
                  <h3 className="font-medium">{state.name}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cluster Selection */}
        {currentStep === 'cluster' && currentState && (
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <button onClick={() => setCurrentStep('state')} className="mr-4 p-2 rounded-lg hover:bg-gray-100"><ChevronLeft className="h-5 w-5" /></button>
              <h2 className="text-xl font-semibold">Select Cluster in <span className="text-blue-600">{currentState.name}</span></h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {clusters.map((cluster) => (
                <div
                  key={cluster._id}
                  className={`bg-white rounded-lg shadow-md p-6 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${currentCluster?._id === cluster._id ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' : ''}`}
                  onClick={() => handleClusterSelect(cluster)}
                >
                  <h3 className="font-medium">{cluster.name}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* District Selection */}
        {currentStep === 'district' && currentCluster && (
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <button onClick={() => setCurrentStep('cluster')} className="mr-4 p-2 rounded-lg hover:bg-gray-100"><ChevronLeft className="h-5 w-5" /></button>
              <h2 className="text-xl font-semibold">Select District in <span className="text-blue-600">{currentCluster.name}</span></h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {districts.map((district) => (
                <div
                  key={district._id}
                  className={`bg-white rounded-lg shadow-md p-6 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${currentDistrict?._id === district._id ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' : ''}`}
                  onClick={() => handleDistrictSelect(district)}
                >
                  <h3 className="font-medium">{district.name}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* City Selection (Multi-select) */}
        {currentStep === 'city' && currentDistrict && (
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <button onClick={() => setCurrentStep('district')} className="mr-4 p-2 rounded-lg hover:bg-gray-100"><ChevronLeft className="h-5 w-5" /></button>
              <h2 className="text-xl font-semibold">Select Cities in <span className="text-blue-600">{currentDistrict.name}</span></h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-100" onClick={handleSelectAllCities}>
                <div className="flex items-center justify-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /><h3 className="font-medium">All Cities</h3></div>
              </div>
              {cities.map((city) => (
                <div
                  key={city._id}
                  className={`bg-white rounded-lg shadow-md p-6 text-center cursor-pointer transition-all ${selectedCities.find(c => c._id === city._id) ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'hover:shadow-lg'}`}
                  onClick={() => toggleCitySelect(city)}
                >
                  <h3 className="font-medium">{city.name}</h3>
                </div>
              ))}
            </div>
            {selectedCities.length > 0 && (
              <div className="mt-8">
                <div className="bg-gray-100 p-4 rounded-lg mb-6">
                  <p className="font-semibold text-sm mb-2">Selected Locations:</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs">{currentCountry?.name}</span>
                    <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs">{currentState?.name}</span>
                    <span className="bg-teal-600 text-white px-3 py-1 rounded-full text-xs">{currentCluster?.name}</span>
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs">{currentDistrict?.name}</span>
                    <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs">{selectedCities.length === cities.length ? 'All Cities' : `${selectedCities.length} Cities`}</span>
                  </div>
                </div>
                <div className="text-right">
                  <button onClick={() => setCurrentStep('department')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Next: Select Department</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Department Selection */}
        {currentStep === 'department' && (
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <button onClick={() => setCurrentStep('district')} className="mr-4 p-2 rounded-lg hover:bg-gray-100"><ChevronLeft className="h-5 w-5" /></button>
              <h2 className="text-xl font-semibold">Select a Department</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {departments.map(dept => (
                <div
                  key={dept._id}
                  className={`bg-white rounded-lg shadow-md p-6 text-center cursor-pointer transition-all hover:scale-105 ${currentDepartment?._id === dept._id ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : ''}`}
                  onClick={() => handleDepartmentSelect(dept)}
                >
                  <h3 className="font-medium text-sm">{dept.name}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tests List */}
        {currentStep === 'tests' && currentDepartment && !showTestForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mt-6">
            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <h4 className="text-xl font-bold text-gray-800">Tests for {currentDepartment.name}</h4>
              <div className="flex gap-2">
                <button onClick={() => setCurrentStep('department')} className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center text-sm">
                  Back
                </button>
                <button
                  onClick={handleAddNewTestClick}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm font-semibold"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Test
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tests.length === 0 ? (
                <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-500">No tests found for this department. Create one!</p>
                </div>
              ) : (
                tests.map(test => (
                  <div key={test._id} className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-lg p-4 shadow-lg relative cursor-pointer hover:scale-[1.02] transition-all">
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button className="text-white/80 hover:text-white bg-blue-500/30 p-1.5 rounded hover:bg-blue-500 transition-colors" onClick={(e) => { e.stopPropagation(); handleEditTest(test); }} title="Edit Test">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button className="text-white/80 hover:text-white bg-red-500/30 p-1.5 rounded hover:bg-red-500 transition-colors" onClick={(e) => handleDeleteTest(e, test._id)} title="Delete Test">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h6 className="font-semibold text-lg mb-2 pr-16 truncate">{test.name}</h6>
                    <div className="text-xs opacity-90 space-y-1 mt-3">
                      <div className="flex justify-between border-b border-indigo-400/30 pb-1"><span>Duration:</span> <span>{test.duration} min</span></div>
                      <div className="flex justify-between border-b border-indigo-400/30 pb-1"><span>Questions:</span> <span>{test.totalQuestions || test.questions?.length || 0}</span></div>
                      <div className="flex justify-between"><span>Passing:</span> <span>{test.passingPercentage}%</span></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Test Creation Form */}
        {currentStep === 'tests' && showTestForm && (
          <div className="bg-white rounded-xl shadow-lg p-0 mt-6 overflow-hidden">
            {/* Header matching PHP screenshot */}
            <div className="bg-white border-b px-6 py-4 flex justify-between items-center bg-gray-50/50">
              <h4 className="text-lg font-bold text-blue-800">
                {editingTestId ? `Edit Test: ${testConfig.name}` : `Create Test for ${currentDepartment.name}`}
              </h4>
              <button onClick={() => { setShowTestForm(false); setEditingTestId(null); }} className="text-sm font-semibold text-gray-500 hover:text-gray-800 flex items-center">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Tests
              </button>
            </div>

            <div className="p-6">
              {/* Config */}
              <div className="mb-8">
                <h5 className="font-bold text-gray-800 mb-4 pb-2">Test Configuration</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Test Name</label>
                    <input
                      type="text" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      value={testConfig.name} onChange={e => setTestConfig({ ...testConfig, name: e.target.value })}
                      placeholder="Enter test name (e.g., Aptitude Test)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Test Duration (minutes)</label>
                    <input
                      type="number" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      value={testConfig.duration} onChange={e => setTestConfig({ ...testConfig, duration: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Total Questions</label>
                    <input
                      type="number" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      value={testConfig.totalQuestions} onChange={e => setTestConfig({ ...testConfig, totalQuestions: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Passing Percentage</label>
                    <input
                      type="number" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      value={testConfig.passingPercentage} onChange={e => setTestConfig({ ...testConfig, passingPercentage: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center mt-2 col-span-2">
                    <input type="checkbox" id="neg_marking" checked={testConfig.negativeMarking} onChange={e => setTestConfig({ ...testConfig, negativeMarking: e.target.checked })} className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <label htmlFor="neg_marking" className="text-sm font-medium text-gray-700">Enable Negative Marking</label>
                  </div>
                </div>
              </div>

              <hr className="my-8 border-gray-200" />

              {/* Questions */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h5 className="font-bold text-gray-800">Test Questions</h5>
                  <button onClick={addNewQuestion} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium flex items-center transition-colors">
                    <Plus className="w-4 h-4 mr-1" /> Add Question
                  </button>
                </div>

                <div className="space-y-6">
                  {questions.map((q, i) => (
                    <div key={q.id} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow transition-shadow">
                      <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h6 className="font-semibold text-blue-800">Question {i + 1}</h6>
                        {questions.length > 1 && (
                          <button onClick={() => removeQuestion(i)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Question Text</label>
                          <textarea
                            className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[100px]"
                            placeholder="Enter your question here..."
                            value={q.text}
                            onChange={e => updateQuestion(i, 'text', e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Question Type</label>
                          <select
                            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={q.type}
                            onChange={e => updateQuestion(i, 'type', e.target.value)}
                          >
                            <option value="Multiple Choice">Multiple Choice</option>
                            <option value="Single Choice">Single Choice</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600 mb-2">Options</label>
                          <div className="space-y-2">
                            {q.options.map((opt, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-3">
                                <div className="flex-1 relative">
                                  <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-8"
                                    value={opt}
                                    onChange={e => updateQuestion(i, 'option', { optionIndex: optIndex, optionValue: e.target.value })}
                                    placeholder={`Option ${optIndex + 1}`}
                                  />
                                </div>
                                <div className="flex items-center gap-2 w-16 justify-center">
                                  <input
                                    type={q.type === 'Single Choice' ? 'radio' : 'checkbox'}
                                    name={`q-${q.id}`}
                                    className="w-4 h-4 text-blue-600 cursor-pointer"
                                    title="Mark as correct answer"
                                    checked={q.correctAnswer.includes(optIndex)}
                                    onChange={() => updateQuestion(i, 'correctAnswer', optIndex)}
                                  />
                                </div>
                                <div className="w-8">
                                  {q.options.length > 2 && (
                                    <button onClick={() => removeOption(i, optIndex)} className="text-gray-400 hover:text-red-500 p-1">
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          <button onClick={() => addOption(i)} className="mt-2 text-sm text-blue-600 font-medium hover:text-blue-800 flex items-center transition-colors">
                            <Plus className="w-3 h-3 mr-1" /> Add Option
                          </button>
                        </div>

                        <div className="w-1/3 pt-2">
                          <label className="block text-sm text-gray-600 mb-1">Marks</label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={q.marks}
                            min="1"
                            onChange={e => updateQuestion(i, 'marks', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <button onClick={saveTestSettings} disabled={isSaving} className="px-5 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold text-sm transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg">
                    {editingTestId ? <Edit className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    {isSaving ? 'Saving Test...' : (editingTestId ? 'Update Test' : 'Save Test')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CandidateTestSetting;