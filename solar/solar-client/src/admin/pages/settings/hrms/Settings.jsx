import React, { useState, useEffect } from 'react';
import {
  Home, Settings as SettingsIcon, Users, Briefcase, Building, MapPin,
  DollarSign, Calendar, Clock, Award, FileText,
  Plus, X, Save, ChevronLeft, ChevronRight,
  Loader, CheckCircle, Edit3, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getStates, getClustersHierarchy, getDistrictsHierarchy, getCountries } from '../../../../services/core/locationApi';
import { getDepartments, getRoles } from '../../../../services/core/masterApi';
import { getHRMSSettings, saveHRMSSettings, updateHRMSSettings, deleteHRMSSettings, getCandidateTrainings } from '../../../../services/hrms/hrmsApi';
import toast from 'react-hot-toast';

const toId = (val) => (val && typeof val === 'object' ? val._id : val);

const AdminHrmssettings = () => {
  const navigate = useNavigate();
  // Data States
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [candidateTrainings, setCandidateTrainings] = useState([]);

  // Selection States
  const [currentCountry, setCurrentCountry] = useState(null); // Objects
  const [currentState, setCurrentState] = useState(null); // Objects
  const [currentCluster, setCurrentCluster] = useState(null); // Objects
  const [currentDistrict, setCurrentDistrict] = useState(null); // Objects
  const [currentDepartment, setCurrentDepartment] = useState(null); // Objects
  const [currentPosition, setCurrentPosition] = useState(null); // Objects (Designation)

  const [savedSettingsList, setSavedSettingsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSettings, setSavedSettings] = useState(null);
  const [editId, setEditId] = useState(null);
  const [allHRMSConfigs, setAllHRMSConfigs] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Form States
  const [skills, setSkills] = useState(['']);
  const [payrollForm, setPayrollForm] = useState({
    payrollType: 'monthly',
    payrollSalary: '',
    peCheck: false,
    peInput: '',
    esicCheck: false,
    esicInput: '',
    performanceLoginTime: '',
    performanceWorkingHours: 8,
    payrollLeaves: '',
    yearlyFreeLeave: '',
    payrollPerks: '',
    payrollBenefits: '',
    payrollEsops: 'eligible',
    activeCpField: '',
    salaryIncrement: '',
    cpOnboardingGoal: '30',
    hybridType: 'monthly',
    perKwCommission: 0,
    perCustomerFileCommission: 0,
    hybridBaseType: 'Monthly',
    hybridSalary: '',
    commissionTypeSelection: 'Per kW Commission'
  });

  const [recruitmentForm, setRecruitmentForm] = useState({
    recruitmentProbation: '',
    recruitmentTrainings: []
  });

  const [performanceForm, setPerformanceForm] = useState({
    performancePayrollType: 'monthly',
    performanceEfficiency: '',
    performanceAttendance: '',
    performanceLeaveImpact: '',
    performanceOverdue: '',
    performanceProductivity: '',
    performanceBreakTime: '',
    performanceIdealTime: '3',
    efficiencyDecreaseGrid: Array.from({ length: 10 }, (_, i) => ({
      range: `${i * 5 + 1}-${(i + 1) * 5}`,
      decrease: ''
    }))
  });

  // Fetch Initial Data (States & Departments)
  useEffect(() => {
    // ... existing initial data fetch ...
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const [countriesData, rolesData, trainingsData] = await Promise.all([
          getCountries(),
          getRoles(),
          getCandidateTrainings()
        ]);
        setCountries(countriesData || []);
        setAllRoles(rolesData?.data || []);
        setCandidateTrainings(trainingsData?.data || []);

        // Set India as default country to ensure hierarchical filtering works
        if (countriesData && countriesData.length > 0) {
          const india = countriesData.find(c => c.name?.toLowerCase() === 'india') || countriesData[0];
          setCurrentCountry(india);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Failed to load initial data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
    fetchAllConfigsOverview();
  }, []);

  const fetchAllConfigsOverview = async () => {
    try {
      const response = await getHRMSSettings();
      if (response.data) {
        setAllHRMSConfigs(response.data);
      }
    } catch (error) {
      console.error("Error fetching all configs overview:", error);
    }
  };

  const getConfigCount = (type, value) => {
    if (!allHRMSConfigs.length) return 0;
    return allHRMSConfigs.filter(config => {
      if (type === 'state') return config.state === value || (config.state?._id === value);
      if (type === 'cluster') return config.cluster === value || (config.cluster?._id === value);
      if (type === 'district') return config.district === value || (config.district?._id === value);
      if (type === 'position') {
        const matchesLocation =
          (!currentCountry || (config.country === currentCountry._id || config.country?._id === currentCountry._id)) &&
          (!currentState || (config.state === currentState._id || config.state?._id === currentState._id)) &&
          (!currentCluster || (config.cluster === currentCluster._id || config.cluster?._id === currentCluster._id)) &&
          (!currentDistrict || (config.district === currentDistrict._id || config.district?._id === currentDistrict._id));
        return matchesLocation && config.position === value;
      }
      return false;
    }).length;
  };

  // Fetch Departments and States when Country changes
  useEffect(() => {
    if (currentCountry?.name) {
      const fetchDataByCountry = async () => {
        try {
          const [statesData, departmentsData] = await Promise.all([
            getStates(currentCountry._id),
            getDepartments({ country: currentCountry.name })
          ]);
          setStates(statesData || []);
          setDepartments(departmentsData?.data || []);
        } catch (error) {
          console.error("Error fetching country data:", error);
          toast.error("Failed to load data for selected country");
        }
      };
      fetchDataByCountry();
    } else {
      setStates([]);
      setDepartments([]);
    }
  }, [currentCountry]);

  // ... other useEffects for Location ...

  // Load Settings Function
  const loadSettings = async () => {
    if (currentDepartment?._id && currentPosition?.name) {
      try {
        const params = {
          department: currentDepartment._id,
          position: currentPosition.name
        };
        if (currentCountry?._id) params.country = currentCountry._id;
        if (currentState?._id) params.state = currentState._id;
        if (currentCluster?._id) params.cluster = currentCluster._id;
        if (currentDistrict?._id) params.district = currentDistrict._id;

        const response = await getHRMSSettings(params);

        if (response.data) {
          setSavedSettingsList(response.data);
          // populateForms(response.data[0]); // Disabled to prevent pre-fill
        } else {
          setSavedSettingsList([]);
          resetForms();
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Failed to load settings");
      }
    }
  };

  // Fetch Settings when Position (Designation) selected
  useEffect(() => {
    loadSettings();
  }, [currentDepartment, currentPosition]);

  // Fetch Clusters when State changes
  useEffect(() => {
    if (currentState?._id) {
      const fetchClusters = async () => {
        try {
          const data = await getClustersHierarchy(currentState._id);
          setClusters(data || []);
        } catch (error) {
          console.error("Error fetching clusters:", error);
          toast.error("Failed to load clusters");
        }
      };
      fetchClusters();
    } else {
      setClusters([]);
    }
  }, [currentState]);

  // Fetch Districts when Cluster changes
  useEffect(() => {
    if (currentCluster?._id) {
      const fetchDistricts = async () => {
        try {
          const data = await getDistrictsHierarchy(currentCluster._id);
          setDistricts(data || []);
        } catch (error) {
          console.error("Error fetching districts:", error);
          toast.error("Failed to load districts");
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
    }
  }, [currentCluster]);

  // Filter Designations (Positions) when Department or Location changes
  useEffect(() => {
    if (currentDepartment?._id) {
      // Filter roles by Department AND Location
      const filtered = allRoles.filter(role => {
        const matchesDept = toId(role.department) === currentDepartment._id;

        const roleCountryId = toId(role.country);
        const roleStateId = toId(role.state);
        const roleClusterId = toId(role.cluster);
        const roleDistrictId = toId(role.district);

        const selCountryId = currentCountry?._id;
        const selStateId = currentState?._id;
        const selClusterId = currentCluster?._id;
        const selDistrictId = currentDistrict?._id;

        // Hierarchical Location Matching Rules (Case-Insensitive):
        const roleLevel = role.level?.toLowerCase();

        // 1. If role is at Country level -> Show if it matches selected Country (or if no country selected yet)
        if (roleLevel === 'country') {
          return matchesDept && (!selCountryId || roleCountryId === selCountryId);
        }

        // 2. If role is at State level -> Show if it matches selected Country AND (no state selected OR matches selected State)
        if (roleLevel === 'state') {
          return matchesDept &&
            (!selCountryId || roleCountryId === selCountryId) &&
            (!selStateId || roleStateId === selStateId);
        }

        // 3. If role is at Cluster level -> Show if matches Country + State AND (no cluster selected OR matches selected Cluster)
        if (roleLevel === 'cluster') {
          return matchesDept &&
            (!selCountryId || roleCountryId === selCountryId) &&
            (!selStateId || roleStateId === selStateId) &&
            (!selClusterId || roleClusterId === selClusterId);
        }

        // 4. If role is at District level -> Show if matches Country + State + Cluster AND (no district selected OR matches selected District)
        if (roleLevel === 'district') {
          return matchesDept &&
            (!selCountryId || roleCountryId === selCountryId) &&
            (!selStateId || roleStateId === selStateId) &&
            (!selClusterId || roleClusterId === selClusterId) &&
            (!selDistrictId || roleDistrictId === selDistrictId);
        }

        // Default fallback (should not hit if level is one of the above)
        return matchesDept &&
          (!selCountryId || roleCountryId === selCountryId) &&
          (!selStateId || roleStateId === selStateId) &&
          (!selClusterId || roleClusterId === selClusterId) &&
          (!selDistrictId || roleDistrictId === selDistrictId);
      });
      setDesignations(filtered);
    } else {
      setDesignations([]);
    }
  }, [currentDepartment, currentCountry, currentState, currentCluster, currentDistrict, allRoles]);

  const populateForms = (settings) => {
    if (settings.payroll) {
      setPayrollForm({
        payrollType: settings.payroll.payrollType || 'monthly',
        payrollSalary: settings.payroll.salary || '',
        peCheck: settings.payroll.peCheck || false,
        peInput: settings.payroll.peInput || '',
        esicCheck: settings.payroll.esicCheck || false,
        esicInput: settings.payroll.esicInput || '',
        performanceLoginTime: settings.payroll.performanceLoginTime || '',
        performanceWorkingHours: settings.payroll.performanceWorkingHours || 8,
        payrollLeaves: settings.payroll.leaves || '',
        payrollPerks: settings.payroll.perks || '',
        payrollBenefits: settings.payroll.benefits || '',
        payrollEsops: settings.payroll.esops || 'eligible',
        hybridType: settings.payroll.hybridType || 'monthly',
        activeCpField: settings.payroll.activeCpField || '',
        salaryIncrement: settings.payroll.salaryIncrement || '',
        cpOnboardingGoal: settings.payroll.cpOnboardingGoal || '30',
        perKwCommission: settings.payroll.perKwCommission || 0,
        perCustomerFileCommission: settings.payroll.perCustomerFileCommission || 0,
        hybridBaseType: settings.payroll.hybridBaseType || 'Monthly',
        hybridSalary: settings.payroll.hybridSalary || '',
        commissionTypeSelection: settings.payroll.commissionTypeSelection || 'Per kW Commission'
      });
    }

    if (settings.recruitment) {
      setRecruitmentForm({
        recruitmentProbation: settings.recruitment.probation || '',
        recruitmentTrainings: settings.recruitment.training || []
      });
    }

    if (settings.performance) {
      const defaultGrid = Array.from({ length: 10 }, (_, i) => ({
        range: `${i * 5 + 1}-${(i + 1) * 5}`,
        decrease: ''
      }));
      setPerformanceForm({
        performanceEfficiency: settings.performance.efficiencyFormula || '',
        performanceAttendance: settings.performance.attendanceReq || '',
        performanceLeaveImpact: settings.performance.leaveImpact || '',
        performanceOverdue: settings.performance.overdueImpact || '',
        performanceProductivity: settings.performance.productivity || '',
        performanceBreakTime: settings.performance.breakTime || '',
        performanceIdealTime: settings.performance.idealTime || '3',
        efficiencyDecreaseGrid: settings.performance.efficiencyDecreaseGrid?.length === 10
          ? settings.performance.efficiencyDecreaseGrid
          : defaultGrid
      });
    }
  };

  const resetForms = () => {
    setPayrollForm({
      payrollType: 'monthly',
      hybridType: 'monthly',
      payrollSalary: '',
      peCheck: false,
      peInput: '',
      esicCheck: false,
      esicInput: '',
      performanceLoginTime: '',
      performanceWorkingHours: 8,
      payrollLeaves: '',
      payrollPerks: '',
      payrollBenefits: '',
      payrollEsops: 'eligible',
      activeCpField: '',
      salaryIncrement: '',
      cpOnboardingGoal: '30',
      perKwCommission: 0,
      perCustomerFileCommission: 0,
      hybridBaseType: 'Monthly',
      hybridSalary: '',
      commissionTypeSelection: 'Per kW Commission'
    });
    setRecruitmentForm({
      recruitmentProbation: '',
      recruitmentTrainings: []
    });
    setPerformanceForm({
      performanceEfficiency: '',
      performanceAttendance: '',
      performanceLeaveImpact: '',
      performanceOverdue: '',
      performanceProductivity: '',
      performanceBreakTime: '',
      performanceIdealTime: '3',
      efficiencyDecreaseGrid: Array.from({ length: 10 }, (_, i) => ({
        range: `${i * 5 + 1}-${(i + 1) * 5}`,
        decrease: ''
      }))
    });
    setSkills(['']);
  };

  // Handlers
  const handleCountrySelect = (country) => {
    setCurrentCountry(country);
    setCurrentState(null);
    setCurrentCluster(null);
    setCurrentDistrict(null);
  };

  const handleStateSelect = (state) => {
    setCurrentState(state);
    setCurrentCluster(null);
    setCurrentDistrict(null);
  };

  const handleClusterSelect = (cluster) => {
    setCurrentCluster(cluster);
    setCurrentDistrict(null);
  };

  const handleDistrictSelect = (district) => {
    setCurrentDistrict(district);
  };

  const handleDepartmentSelect = (department) => {
    setCurrentDepartment(department);
    setCurrentPosition(null);
  };

  const handlePositionSelect = (position) => {
    setCurrentPosition(position);
  };

  const addSkillField = () => setSkills([...skills, '']);

  const removeSkillField = (index) => {
    const newSkills = skills.filter((_, i) => i !== index);
    setSkills(newSkills.length > 0 ? newSkills : ['']);
  };

  const handleSkillChange = (index, value) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    setSkills(newSkills);
  };

  // SAVE HANDLER
  const handleSaveAll = async (e) => {
    if (e) e.preventDefault();

    if (!currentDepartment || !currentPosition) {
      toast.error("Please select a department and position first");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        department: currentDepartment._id,
        position: currentPosition.name,
        settingType: 'unified'
      };
      if (currentCountry?._id) payload.country = currentCountry._id;
      if (currentState?._id) payload.state = currentState._id;
      if (currentCluster?._id) payload.cluster = currentCluster._id;
      if (currentDistrict?._id) payload.district = currentDistrict._id;

      payload.payroll = {
        payrollType: payrollForm.payrollType,
        hybridType: payrollForm.hybridType,
        salary: payrollForm.payrollSalary,
        peCheck: payrollForm.peCheck,
        peInput: payrollForm.peInput,
        esicCheck: payrollForm.esicCheck,
        esicInput: payrollForm.esicInput,
        performanceLoginTime: payrollForm.performanceLoginTime,
        performanceWorkingHours: payrollForm.performanceWorkingHours,
        leaves: payrollForm.payrollLeaves,
        yearlyFreeLeave: payrollForm.yearlyFreeLeave,
        perks: payrollForm.payrollPerks,
        benefits: payrollForm.payrollBenefits,
        esops: payrollForm.payrollEsops,
        activeCpField: payrollForm.activeCpField,
        salaryIncrement: payrollForm.salaryIncrement,
        cpOnboardingGoal: payrollForm.cpOnboardingGoal,
        perKwCommission: payrollForm.perKwCommission,
        perCustomerFileCommission: payrollForm.perCustomerFileCommission,
        hybridBaseType: payrollForm.hybridBaseType,
        hybridSalary: payrollForm.hybridSalary,
        commissionTypeSelection: payrollForm.commissionTypeSelection
      };

      payload.recruitment = {
        probation: recruitmentForm.recruitmentProbation,
        training: recruitmentForm.recruitmentTrainings
      };

      payload.performance = {
        efficiencyFormula: performanceForm.performanceEfficiency,
        attendanceReq: performanceForm.performanceAttendance,
        leaveImpact: performanceForm.performanceLeaveImpact,
        overdueImpact: performanceForm.performanceOverdue,
        productivity: performanceForm.performanceProductivity,
        breakTime: performanceForm.performanceBreakTime,
        idealTime: performanceForm.performanceIdealTime,
        efficiencyDecreaseGrid: performanceForm.efficiencyDecreaseGrid
      };

      let response;
      if (editId) {
        response = await updateHRMSSettings(editId, payload);
        toast.success("Settings updated successfully!");
        setEditId(null);
      } else {
        response = await saveHRMSSettings(payload);
        setShowSuccessModal(true); // Show Success Modal for new creates
      }

      await loadSettings(); // Refresh saved settings display
      await fetchAllConfigsOverview(); // Refresh counts
    } catch (error) {
      console.error("Error saving settings:", error);
      const errorMsg = error.message || (typeof error === 'string' ? error : "Failed to save settings");
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditConfig = (setting) => {
    setEditId(setting._id);

    // Populate form states
    setPayrollForm({
      payrollType: setting.payroll?.payrollType || 'monthly',
      payrollSalary: setting.payroll?.salary || '',
      peCheck: setting.payroll?.peCheck || false,
      peInput: setting.payroll?.peInput || '',
      esicCheck: setting.payroll?.esicCheck || false,
      esicInput: setting.payroll?.esicInput || '',
      performanceLoginTime: setting.payroll?.performanceLoginTime || '',
      performanceWorkingHours: setting.payroll?.performanceWorkingHours || 8,
      payrollLeaves: setting.payroll?.leaves || '',
      yearlyFreeLeave: setting.payroll?.yearlyFreeLeave || '',
      payrollPerks: setting.payroll?.perks || '',
      payrollBenefits: setting.payroll?.benefits || '',
      payrollEsops: setting.payroll?.esops || 'eligible',
      activeCpField: setting.payroll?.activeCpField || '',
      salaryIncrement: setting.payroll?.salaryIncrement || '',
      cpOnboardingGoal: setting.payroll?.cpOnboardingGoal || '30',
      perKwCommission: setting.payroll?.perKwCommission || 0,
      perCustomerFileCommission: setting.payroll?.perCustomerFileCommission || 0,
      hybridBaseType: setting.payroll?.hybridBaseType || 'Monthly',
      hybridSalary: setting.payroll?.hybridSalary || '',
      commissionTypeSelection: setting.payroll?.commissionTypeSelection || 'Per kW Commission'
    });

    setRecruitmentForm({
      recruitmentProbation: setting.recruitment?.probation || '',
      recruitmentTrainings: setting.recruitment?.training || []
    });

    setPerformanceForm({
      performanceEfficiency: setting.performance?.efficiencyFormula || '',
      performanceAttendance: setting.performance?.attendanceReq || '',
      performanceLeaveImpact: setting.performance?.leaveImpact || '',
      performanceOverdue: setting.performance?.overdueImpact || '',
      performanceProductivity: setting.performance?.productivity || '',
      performanceBreakTime: setting.performance?.breakTime || '',
      performanceIdealTime: setting.performance?.idealTime || '3',
      efficiencyDecreaseGrid: setting.performance?.efficiencyDecreaseGrid?.length > 0
        ? setting.performance.efficiencyDecreaseGrid
        : Array.from({ length: 10 }, (_, i) => ({ range: `${i * 5 + 1}-${(i + 1) * 5}`, decrease: '' }))
    });

    // Scroll to top removed because Edit occurs in a modal overlay now.
    // window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteConfig = (settingId) => {
    setDeleteTargetId(settingId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteHRMSSettings(deleteTargetId);
      toast.success("Configuration deleted successfully");
      loadSettings();
      fetchAllConfigsOverview();
      if (editId === deleteTargetId) setEditId(null);
    } catch (error) {
      console.error("Error deleting setting:", error);
      toast.error("Failed to delete configuration");
    } finally {
      setShowDeleteModal(false);
      setDeleteTargetId(null);
    }
  };

  const getDepartmentCardClass = (deptId) => {
    const baseClasses = "bg-white text-gray-700 font-semibold text-center py-6 px-4 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.3)] transition-all duration-300 hover:shadow-md cursor-pointer border ";
    // Check selection by ID
    if (currentDepartment?._id === deptId) {
      return baseClasses + "border-2 border-blue-500 text-blue-600 bg-blue-50";
    }
    // Default style
    return baseClasses + "border-gray-100 hover:border-blue-200";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mb-6">
        <nav className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <SettingsIcon className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-800">Admin HRMS Settings</h1>
          </div>
        </nav>
      </div>

      <div className="container mx-auto px-4">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <Loader className="w-10 h-10 text-white animate-spin" />
          </div>
        )}

        {/* Country Selection */}
        <div className="location-section mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Select a Country</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {countries.map((country) => (
              <div
                key={country._id}
                className={`bg-white text-gray-700 font-semibold text-center py-6 px-4 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.3)] transition-all duration-300 hover:shadow-md cursor-pointer border ${currentCountry?._id === country._id ? 'border-2 border-blue-500 text-blue-600' : 'border-gray-100 hover:border-blue-200'}`}
                onClick={() => handleCountrySelect(country)}
              >
                <div className="w-10 h-10 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <Home className={`w-5 h-5 ${currentCountry?._id === country._id ? 'text-blue-600' : 'text-gray-500'}`} />
                </div>
                <h6 className="text-sm font-semibold">{country.name}</h6>
              </div>
            ))}
            {countries.length === 0 && !isLoading && <p className="text-gray-500 italic">No countries found.</p>}
          </div>
        </div>

        {/* State Selection */}
        {currentCountry && (
          <div className="location-section mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Select a State in <span className="text-blue-600">{currentCountry.name}</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {states.map((state) => (
                <div
                  key={state._id}
                  className={`bg-white text-gray-700 font-semibold text-center py-6 px-4 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.3)] transition-all duration-300 hover:shadow-md cursor-pointer border ${currentState?._id === state._id ? 'border-2 border-blue-500 text-blue-600' : 'border-gray-100 hover:border-blue-200'}`}
                  onClick={() => handleStateSelect(state)}
                >
                  <div className="w-10 h-10 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <MapPin className={`w-5 h-5 ${currentState?._id === state._id ? 'text-blue-600' : 'text-gray-500'}`} />
                  </div>
                  <h6 className="text-sm font-semibold">{state.name}</h6>
                  <p className="text-[10px] text-gray-400 mt-1">{getConfigCount('state', state._id)} Configurations</p>
                </div>
              ))}
              {states.length === 0 && !isLoading && <p className="text-gray-500 italic">No states found.</p>}
            </div>
          </div>
        )}

        {/* Cluster Selection */}
        {currentState && (
          <div className="location-section mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Select a Cluster in <span className="text-blue-600">{currentState.name}</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {clusters.map((cluster) => (
                <div
                  key={cluster._id}
                  className={`bg-white text-gray-700 font-semibold text-center py-6 px-4 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.3)] transition-all duration-300 hover:shadow-md cursor-pointer border ${currentCluster?._id === cluster._id ? 'border-2 border-orange-500 text-orange-600' : 'border-gray-100 hover:border-orange-200'}`}
                  onClick={() => handleClusterSelect(cluster)}
                >
                  <div className="w-10 h-10 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <MapPin className={`w-5 h-5 ${currentCluster?._id === cluster._id ? 'text-orange-600' : 'text-gray-500'}`} />
                  </div>
                  <h6 className="text-sm font-semibold">{cluster.name}</h6>
                  <p className="text-[10px] text-gray-400 mt-1">{getConfigCount('cluster', cluster._id)} Configurations</p>
                </div>
              ))}
              {clusters.length === 0 && !isLoading && <p className="text-gray-500 italic">No clusters found.</p>}
            </div>
          </div>
        )}

        {/* District Selection */}
        {currentCluster && (
          <div className="location-section mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Select a District in <span className="text-blue-600">{currentCluster.name}</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {districts.map((district) => (
                <div
                  key={district._id}
                  className={`bg-white text-gray-700 font-semibold text-center py-6 px-4 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.3)] transition-all duration-300 hover:shadow-md cursor-pointer border ${currentDistrict?._id === district._id ? 'border-2 border-purple-500 text-purple-600' : 'border-gray-100 hover:border-purple-200'}`}
                  onClick={() => handleDistrictSelect(district)}
                >
                  <div className="w-10 h-10 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <MapPin className={`w-5 h-5 ${currentDistrict?._id === district._id ? 'text-purple-600' : 'text-gray-500'}`} />
                  </div>
                  <h6 className="text-sm font-semibold">{district.name}</h6>
                  <p className="text-[10px] text-gray-400 mt-1">{getConfigCount('district', district._id)} Configurations</p>
                </div>
              ))}
              {districts.length === 0 && !isLoading && <p className="text-gray-500 italic">No districts found.</p>}
            </div>
          </div>
        )}

        {/* Department Selection */}
        <div className="location-section mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Select a Department</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.isArray(departments) && departments.map((dept) => (
              <div
                key={dept._id}
                className={getDepartmentCardClass(dept._id)}
                onClick={() => handleDepartmentSelect(dept)}
              >
                <div className="w-10 h-10 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <Users className={`w-5 h-5 ${currentDepartment?._id === dept._id ? 'text-blue-600' : 'text-gray-500'}`} />
                </div>
                <h6 className="text-sm font-semibold">{dept.name}</h6>
              </div>
            ))}
            {departments.length === 0 && !isLoading && <p className="text-gray-500 italic">No departments found.</p>}
          </div>
        </div>

        {/* Position Selection */}
        {currentDepartment && (
          <div className="location-section mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Select a Position</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.isArray(designations) && designations.map((pos) => (
                <div
                  key={pos._id}
                  className={`bg-white text-gray-700 font-semibold text-center py-6 px-4 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.3)] transition-all duration-300 hover:shadow-md cursor-pointer border ${currentPosition?._id === pos._id ? 'border-2 border-blue-500 text-blue-600' : 'border-gray-100 hover:border-blue-200'}`}
                  onClick={() => handlePositionSelect(pos)}
                >
                  <div className="w-10 h-10 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <Briefcase className={`w-5 h-5 ${currentPosition?._id === pos._id ? 'text-blue-600' : 'text-gray-500'}`} />
                  </div>
                  <h6 className="text-sm font-semibold">{pos.name}</h6>
                  <p className="text-[10px] text-gray-400 mt-1">{getConfigCount('position', pos.name)} Configurations</p>
                </div>
              ))}
              {designations.length === 0 && !isLoading && <p className="text-gray-500 italic">No positions found for this department.</p>}
            </div>
          </div>
        )}

        {/* Department Settings Form */}
        {currentDepartment && currentPosition && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-2xl font-bold text-blue-600">
                {currentDepartment.name} Settings - {currentPosition.name}
              </h4>
            </div>


            <div className="mt-6">
              <div className={editId ? "fixed inset-0 z-[60] overflow-y-auto bg-black bg-opacity-50 flex items-start justify-center p-4 transition-all" : ""}>
                <div className={editId ? "bg-white rounded-xl shadow-2xl p-6 max-w-6xl w-full my-8 relative" : ""}>
                  {editId && (
                    <div className="flex justify-between items-center border-b pb-4 mb-6 sticky top-0 bg-white z-10 pt-2">
                      <h3 className="text-2xl font-bold text-blue-800">Edit Configuration: {currentPosition.name}</h3>
                      <button type="button" onClick={() => setEditId(null)} className="p-2 bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                    </div>
                  )}
                  <form onSubmit={handleSaveAll}>
                    {/* Section 1: Payroll and Employee Work Configuration */}
                    <div className="mb-8 p-6 border rounded-lg bg-gray-50 border-gray-200">
                      <h5 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2 text-blue-700">Section 1: Payroll & Work Configuration</h5>
                      {/* CPRM Specific Fields */}
                      {currentDepartment.name.toLowerCase().includes('cprm') && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Number Of Active CP</label>
                              <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={payrollForm.activeCpField} onChange={(e) => setPayrollForm({ ...payrollForm, activeCpField: e.target.value })} placeholder="Enter Number Of active CP" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Salary Increment</label>
                              <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={payrollForm.salaryIncrement} onChange={(e) => setPayrollForm({ ...payrollForm, salaryIncrement: e.target.value })} placeholder="e.g., 5000" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">CP Onboarding Goal</label>
                              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={payrollForm.cpOnboardingGoal} onChange={(e) => setPayrollForm({ ...payrollForm, cpOnboardingGoal: e.target.value })}>
                                <option value="30">30</option>
                                <option value="60">60</option>
                                <option value="90">90</option>
                              </select>
                            </div>
                          </div>
                          <hr className="my-6 border-gray-300" />
                        </>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* 1. Payroll Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Payroll Type</label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={payrollForm.payrollType} onChange={(e) => setPayrollForm({ ...payrollForm, payrollType: e.target.value })}>
                            <option value="monthly">Monthly</option>
                            <option value="hourly">Hourly</option>
                            <option value="commisionbased">Commission Based</option>
                            <option value="hybrid">Hybrid</option>
                          </select>
                        </div>

                        {/* 2. Hybrid Base Type (Condition: Hybrid only) */}
                        {payrollForm.payrollType === 'hybrid' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Hybrid Base Type</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={payrollForm.hybridBaseType} onChange={(e) => setPayrollForm({ ...payrollForm, hybridBaseType: e.target.value })}>
                              <option value="Monthly">Monthly</option>
                              <option value="Hourly">Hourly</option>
                            </select>
                          </div>
                        )}

                        {/* 3. Salary Range (Condition: NOT commission-based) */}
                        {payrollForm.payrollType !== 'commisionbased' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {payrollForm.payrollType === 'hybrid'
                                ? `${payrollForm.hybridBaseType} Hybrid Salary Range (₹)`
                                : payrollForm.payrollType === 'hourly'
                                  ? 'Per Hourly Salary (₹)'
                                  : `${payrollForm.payrollType?.charAt(0).toUpperCase() + payrollForm.payrollType?.slice(1)} Salary Range (₹)`}
                            </label>
                            {payrollForm.payrollType === 'hybrid' ? (
                              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={payrollForm.hybridSalary} onChange={(e) => setPayrollForm({ ...payrollForm, hybridSalary: e.target.value })} placeholder="e.g. 30,000 - 50,000" />
                            ) : (
                              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={payrollForm.payrollSalary} onChange={(e) => setPayrollForm({ ...payrollForm, payrollSalary: e.target.value })} placeholder="e.g. 30,000 - 50,000" />
                            )}
                          </div>
                        )}

                        {/* 4. Commission Type Selection (Condition: Hybrid or Commission Based) */}
                        {(payrollForm.payrollType === 'hybrid' || payrollForm.payrollType === 'commisionbased') && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Commission Type Selection</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={payrollForm.commissionTypeSelection} onChange={(e) => setPayrollForm({ ...payrollForm, commissionTypeSelection: e.target.value })}>
                              <option value="Per kW Commission">Per kW Commission</option>
                              <option value="Per Customer File">Per Customer File</option>
                            </select>
                          </div>
                        )}

                        {/* 5. Commission Amount (Condition: Hybrid or Commission Based) */}
                        {(payrollForm.payrollType === 'hybrid' || payrollForm.payrollType === 'commisionbased') && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {payrollForm.commissionTypeSelection === 'Per kW Commission' ? 'Per kW Commission (₹)' : 'Per Customer File Commission (₹)'}
                            </label>
                            {payrollForm.commissionTypeSelection === 'Per kW Commission' ? (
                              <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={payrollForm.perKwCommission} onChange={(e) => setPayrollForm({ ...payrollForm, perKwCommission: e.target.value })} placeholder="Enter per kW commission" />
                            ) : (
                              <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={payrollForm.perCustomerFileCommission} onChange={(e) => setPayrollForm({ ...payrollForm, perCustomerFileCommission: e.target.value })} placeholder="Enter per file commission" />
                            )}
                          </div>
                        )}

                        {/* 6. Govt Tax Deduction (Always) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Govt Tax Deduction</label>
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <input type="checkbox" className="mr-2" checked={payrollForm.peCheck} onChange={(e) => setPayrollForm({ ...payrollForm, peCheck: e.target.checked })} />
                              <label className="mr-2 text-sm">PE (%)</label>
                              <input type="number" className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white" value={payrollForm.peInput} onChange={(e) => setPayrollForm({ ...payrollForm, peInput: e.target.value })} placeholder="e.g. 12" />
                            </div>
                            <div className="flex items-center">
                              <input type="checkbox" className="mr-2" checked={payrollForm.esicCheck} onChange={(e) => setPayrollForm({ ...payrollForm, esicCheck: e.target.checked })} />
                              <label className="mr-2 text-sm">ESIC (%)</label>
                              <input type="number" className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white" value={payrollForm.esicInput} onChange={(e) => setPayrollForm({ ...payrollForm, esicInput: e.target.value })} placeholder="e.g. 1.75" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Login Time Requirement (HH:MM)</label>
                          <input type="time" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={payrollForm.performanceLoginTime} onChange={(e) => setPayrollForm({ ...payrollForm, performanceLoginTime: e.target.value })} />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Set Minimum Working Hours</label>
                          <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={payrollForm.performanceWorkingHours} onChange={(e) => setPayrollForm({ ...payrollForm, performanceWorkingHours: e.target.value })} min="1" max="24" step="1" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Paid Leave</label>
                          <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={payrollForm.payrollLeaves} onChange={(e) => setPayrollForm({ ...payrollForm, payrollLeaves: e.target.value })} placeholder="e.g. 2" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Yearly Free Leave</label>
                          <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={payrollForm.yearlyFreeLeave} onChange={(e) => setPayrollForm({ ...payrollForm, yearlyFreeLeave: e.target.value })} placeholder="e.g. 12" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Perks</label>
                          <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={payrollForm.payrollPerks} onChange={(e) => setPayrollForm({ ...payrollForm, payrollPerks: e.target.value })} placeholder="e.g. Travel, Internet" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Benefits</label>
                          <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={payrollForm.payrollBenefits} onChange={(e) => setPayrollForm({ ...payrollForm, payrollBenefits: e.target.value })} placeholder="e.g. Health Insurance, PF" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">ESOPs Eligibility</label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={payrollForm.payrollEsops} onChange={(e) => setPayrollForm({ ...payrollForm, payrollEsops: e.target.value })}>
                            <option value="eligible">Eligible</option>
                            <option value="noteligible">Not Eligible</option>
                            <option value="after1year">After 1 Year</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Recruitment Settings */}
                    <div className="mb-8 p-6 border rounded-lg bg-gray-50 border-gray-200">
                      <h5 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2 text-blue-700">Section 2: Recruitment Settings</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Probation Period (Months)</label>
                          <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={recruitmentForm.recruitmentProbation} onChange={(e) => setRecruitmentForm({ ...recruitmentForm, recruitmentProbation: e.target.value })} placeholder="e.g. 3" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Training Modules Required</label>
                          <div className="bg-white border text-sm border-gray-300 rounded-md overflow-hidden max-h-48 overflow-y-auto w-full">
                            {['solarrooftop', 'solarpump', 'solarstreetlight'].map(moduleCat => {
                              const isChecked = recruitmentForm.recruitmentTrainings.includes(moduleCat);
                              const moduleName = moduleCat === 'solarrooftop' ? 'Solar Rooftop' : moduleCat === 'solarpump' ? 'Solar Pump' : 'Street Light';

                              return (
                                <label key={moduleCat} className={`flex items-center px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors ${isChecked ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-3"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setRecruitmentForm(prev => ({ ...prev, recruitmentTrainings: [...prev.recruitmentTrainings, moduleCat] }));
                                      } else {
                                        setRecruitmentForm(prev => ({ ...prev, recruitmentTrainings: prev.recruitmentTrainings.filter(i => i !== moduleCat) }));
                                      }
                                    }}
                                  />
                                  <span className={`font-medium ${isChecked ? 'text-blue-700' : 'text-gray-700'}`}>{moduleName} Training</span>
                                </label>
                              );
                            })}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Select the required training modules mapped from the Candidate Training Settings.</p>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Performance Settings */}
                    <div className="mb-8 p-6 border rounded-lg bg-gray-50 border-gray-200">
                      <h5 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2 text-blue-700">Section 3: Performance Settings</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Column 1 */}
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Attendance Required (%)</label>
                            <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white" value={performanceForm.performanceAttendance} onChange={(e) => setPerformanceForm({ ...performanceForm, performanceAttendance: e.target.value })} placeholder="95" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Overdue Task Impact (%)</label>
                            <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white" value={performanceForm.performanceOverdue} onChange={(e) => setPerformanceForm({ ...performanceForm, performanceOverdue: e.target.value })} placeholder="e.g. 5%" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Break Time Allowed (in minutes)</label>
                            <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white" value={performanceForm.performanceBreakTime} onChange={(e) => setPerformanceForm({ ...performanceForm, performanceBreakTime: e.target.value })} placeholder="30" />
                          </div>
                        </div>

                        {/* Column 2 */}
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Efficiency Score Formula</label>
                            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white" value={performanceForm.performanceEfficiency} onChange={(e) => setPerformanceForm({ ...performanceForm, performanceEfficiency: e.target.value })} placeholder="(TasksCompleted/Target)*100" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Unauthorized Leave Impact (%)</label>
                            <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white" value={performanceForm.performanceLeaveImpact} onChange={(e) => setPerformanceForm({ ...performanceForm, performanceLeaveImpact: e.target.value })} placeholder="5" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Productivity Target (%)</label>
                            <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white" value={performanceForm.performanceProductivity} onChange={(e) => setPerformanceForm({ ...performanceForm, performanceProductivity: e.target.value })} placeholder="90" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Set Productivity Ideal Time (in minutes)</label>
                            <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white" value={performanceForm.performanceIdealTime} onChange={(e) => setPerformanceForm({ ...performanceForm, performanceIdealTime: e.target.value })} placeholder="3" />
                          </div>
                        </div>
                      </div>

                      {/* Efficiency Decrease Grid */}
                      <div className="mb-6">
                        <h4 className="text-center font-semibold text-blue-600 mb-4">Efficiency Decrease Based on Overdue Tasks</h4>
                        <div className="border rounded-md overflow-hidden border-gray-300">
                          <div className="grid grid-cols-2 bg-blue-500 text-white font-medium text-sm">
                            <div className="p-3 border-r border-blue-400">Overdue Task Range</div>
                            <div className="p-3">Efficiency Decrease (%)</div>
                          </div>
                          {performanceForm.efficiencyDecreaseGrid.map((row, index) => (
                            <div key={index} className="grid grid-cols-2 border-t border-gray-200 bg-white text-gray-700">
                              <div className="p-2 border-r border-gray-200 flex items-center">
                                <span className="text-sm ml-2">{row.range}</span>
                              </div>
                              <div className="p-2">
                                <input type="number" className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-400" value={row.decrease} onChange={(e) => { const newGrid = [...performanceForm.efficiencyDecreaseGrid]; newGrid[index].decrease = e.target.value; setPerformanceForm({ ...performanceForm, efficiencyDecreaseGrid: newGrid }); }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Submitting Button */}
                    <div className="text-center mt-8 mb-8 flex justify-center gap-4">
                      {editId && (
                        <button type="button" onClick={() => setEditId(null)} className="px-8 py-3 bg-gray-400 text-white font-bold text-lg rounded-full shadow-lg hover:bg-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all inline-flex items-center">
                          Cancel Edit
                        </button>
                      )}
                      <button type="submit" disabled={isSaving} className="px-10 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-bold text-lg rounded-full shadow-lg hover:from-green-600 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all disabled:opacity-50 inline-flex items-center">
                        {isSaving ? 'Saving...' : (editId ? 'Update Configure' : 'Create Configure')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Unified Saved Configurations Display */}
              {savedSettingsList.length > 0 && (
                <div className="space-y-6 mt-12 mb-8">
                  <h4 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-300 pb-3">Saved Configurations</h4>
                  {savedSettingsList.map((settings, index) => (
                    <div key={settings._id || index} className="bg-white border text-gray-700 border-gray-200 rounded-lg p-6 flex flex-col justify-between relative shadow-sm hover:shadow transition-shadow">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="font-bold text-lg text-blue-800">{settings.position}</h5>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditConfig(settings)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Edit Configuration">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteConfig(settings._id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Delete Configuration">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        {/* Payroll Settings Summary */}
                        <div>
                          <h6 className="font-bold text-gray-900 border-b pb-1 mb-2">1. Payroll</h6>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Type:</span> <span className="font-medium capitalize">{settings.payroll?.payrollType === 'hybrid' ? `${settings.payroll.hybridBaseType} Hybrid` : settings.payroll?.payrollType || 'N/A'}</span></div>
                            {settings.payroll?.payrollType === 'commisionbased' && (
                              <>
                                <div className="flex justify-between"><span className="text-gray-500">Comm. Type:</span> <span className="font-medium">{settings.payroll.commissionTypeSelection}</span></div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Amount:</span>
                                  <span className="font-medium">
                                    ₹{settings.payroll.commissionTypeSelection === 'Per kW Commission' ? settings.payroll.perKwCommission : settings.payroll.perCustomerFileCommission}
                                  </span>
                                </div>
                              </>
                            )}
                            {settings.payroll?.payrollType === 'hybrid' && (
                              <>
                                <div className="flex justify-between"><span className="text-gray-500">Salary:</span> <span className="font-medium">{settings.payroll.hybridSalary || 'N/A'}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Comm. Type:</span> <span className="font-medium">{settings.payroll.commissionTypeSelection}</span></div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Comm. Amount:</span>
                                  <span className="font-medium">
                                    ₹{settings.payroll.commissionTypeSelection === 'Per kW Commission' ? settings.payroll.perKwCommission : settings.payroll.perCustomerFileCommission}
                                  </span>
                                </div>
                              </>
                            )}
                            {settings.payroll?.payrollType !== 'hybrid' && settings.payroll?.payrollType !== 'commisionbased' && (
                              <div className="flex justify-between"><span className="text-gray-500">Salary Range:</span> <span className="font-medium">{settings.payroll?.salary || 'N/A'}</span></div>
                            )}
                            <div className="flex justify-between"><span className="text-gray-500">Working Hrs:</span> <span className="font-medium">{settings.payroll?.performanceWorkingHours ? `${settings.payroll.performanceWorkingHours} hrs` : 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Login Time:</span> <span className="font-medium">{settings.payroll?.performanceLoginTime || 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">ESOPs:</span> <span className="font-medium capitalize">{settings.payroll?.esops || 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Monthly Leaves:</span> <span className="font-medium">{settings.payroll?.leaves || 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Yearly Leaves:</span> <span className="font-medium">{settings.payroll?.yearlyFreeLeave || 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">PE (%):</span> <span className="font-medium">{settings.payroll?.peCheck ? `${settings.payroll.peInput}% ` : 'Off'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">ESIC (%):</span> <span className="font-medium">{settings.payroll?.esicCheck ? `${settings.payroll.esicInput}% ` : 'Off'}</span></div>
                            {settings.payroll?.activeCpField && <div className="flex justify-between"><span className="text-gray-500">Active CP Goal:</span> <span className="font-medium">{settings.payroll.activeCpField}</span></div>}
                          </div>
                        </div>

                        {/* Recruitment Settings Summary */}
                        <div>
                          <h6 className="font-bold text-gray-900 border-b pb-1 mb-2">2. Recruitment</h6>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Probation:</span> <span className="font-medium">{settings.recruitment?.probation ? `${settings.recruitment.probation} Months` : 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Training Modules:</span> <span className="font-medium text-right pl-2 break-words max-w-[150px]">
                              {settings.recruitment?.training?.length
                                ? settings.recruitment.training.map(cat => cat === 'solarrooftop' ? 'Solar Rooftop' : cat === 'solarpump' ? 'Solar Pump' : 'Street Light').join(', ')
                                : 'None'}
                            </span></div>
                          </div>
                        </div>

                        {/* Performance Settings Summary */}
                        <div>
                          <h6 className="font-bold text-gray-900 border-b pb-1 mb-2">3. Performance</h6>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Target (%):</span> <span className="font-medium">{settings.performance?.productivity ? `${settings.performance.productivity}% ` : 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Attendance (%):</span> <span className="font-medium">{settings.performance?.attendanceReq ? `${settings.performance.attendanceReq}% ` : 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Formula:</span> <span className="font-medium">{settings.performance?.efficiencyFormula || 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Overdue Impact:</span> <span className="font-medium">{settings.performance?.overdueImpact ? `${settings.performance.overdueImpact}% ` : 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Break Time:</span> <span className="font-medium">{settings.performance?.breakTime ? `${settings.performance.breakTime} mins` : 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Ideal Time:</span> <span className="font-medium">{settings.performance?.idealTime ? `${settings.performance.idealTime} mins` : 'N/A'}</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl transform transition-all scale-100">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6 font-medium">Are you sure you want to delete this configuration?</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteTargetId(null);
                  }}
                  className="px-4 py-2 border rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-sm w-full text-center shadow-xl transform transition-all scale-100">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Success!</h3>
              <p className="text-gray-600 mb-6">Settings have been saved successfully to the database.</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHrmssettings;