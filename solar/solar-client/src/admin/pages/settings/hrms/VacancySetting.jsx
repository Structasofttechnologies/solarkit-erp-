import React, { useState, useEffect } from 'react';
import {
    Briefcase, MapPin, Building, Users,
    Plus, X, Save, ArrowLeft, CheckCircle,
    Trash2, Clock, ListChecks, Edit, Loader, GraduationCap, ChevronLeft,
    Calendar, Award, FileText, ClipboardList
} from 'lucide-react';
import { getCountries, getStates, getClusters, getDistricts, getCities } from '../../../../services/core/locationApi';
import { getDepartments, getRoles } from '../../../../services/core/masterApi';
import { getVacancies, createVacancy, deleteVacancy, updateVacancy, addCandidate, getCandidatesByVacancy, updateCandidateStatus, deleteCandidate } from '../../../../services/hrms/hrmsApi';
import toast from 'react-hot-toast';

const VacancySetting = () => {
    // Data States
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [clusters, setClusters] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [cities, setCities] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [vacancies, setVacancies] = useState([]);

    // Selection States
    const [currentStep, setCurrentStep] = useState('country');
    const [currentCountry, setCurrentCountry] = useState(null);
    const [currentState, setCurrentState] = useState(null);
    const [currentCluster, setCurrentCluster] = useState(null);
    const [currentDistrict, setCurrentDistrict] = useState(null);
    const [selectedCities, setSelectedCities] = useState([]);
    const [currentDepartment, setCurrentDepartment] = useState(null);
    const [currentPosition, setCurrentPosition] = useState(null);

    const [showVacancyForm, setShowVacancyForm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingVacancy, setEditingVacancy] = useState(null);

    const [vacancyData, setVacancyData] = useState({
        title: '',
        count: 1,
        experience: '',
        skills: [''],
        education: '',
        certifications: '',
        deadline: '',
        jobType: 'fulltime',
        description: '',
        responsibilities: '',
        salary: '',
        joiningDate: ''
    });

    // Candidate Modal States
    const [showCandidateModal, setShowCandidateModal] = useState(false);
    const [selectedVacancyForCandidate, setSelectedVacancyForCandidate] = useState(null);
    const [candidateFormData, setCandidateFormData] = useState({ name: '', mobile: '', email: '' });
    const [generatedCredentials, setGeneratedCredentials] = useState(null);
    const [isAddingCandidate, setIsAddingCandidate] = useState(false);

    // Candidates List Modal
    const [showCandidatesListModal, setShowCandidatesListModal] = useState(false);
    const [candidatesList, setCandidatesList] = useState([]);
    const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
    const statusOptions = ['Pending', 'Applied', 'Test Completed', 'Under Review', 'Selected', 'Rejected', 'Joined'];

    // Initial Data Load
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [countriesData, departmentsData, designationsData] = await Promise.all([
                    getCountries(),
                    getDepartments(),
                    getRoles()
                ]);
                setCountries(countriesData || []);
                setDepartments(departmentsData?.data || departmentsData || []);
                setPositions(designationsData?.data || designationsData || []);
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


    // Fetch Vacancies when Position Selected
    useEffect(() => {
        if (currentPosition?._id) {
            fetchVacancies();
            if (currentStep === 'position') {
                setCurrentStep('vacancies');
            }
            setShowVacancyForm(false);
        }
    }, [currentPosition]);

    const fetchVacancies = async () => {
        if (!currentDepartment?._id) return;
        try {
            const params = {
                department: currentDepartment._id,
                position: currentPosition?.name
            };
            if (currentCountry?._id) params.country = currentCountry._id;
            if (currentState?._id) params.state = currentState._id;
            if (currentCluster?._id) params.cluster = currentCluster._id;
            if (currentDistrict?._id) params.district = currentDistrict._id;

            const response = await getVacancies(params);
            setVacancies(response.data || []);
        } catch (error) {
            console.error("Error fetching vacancies:", error);
            toast.error("Failed to load vacancies");
        }
    };

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

    const handleProceedToForm = () => {
        if (selectedCities.length === 0) return toast.error('Please select at least one city');
        setCurrentStep('vacancyForm');
        fetchVacanciesInScope(); // to populate table if needed
    };

    const fetchVacanciesInScope = async () => {
        try {
            const params = {
                country: currentCountry._id,
                state: currentState._id,
                cluster: currentCluster._id,
                district: currentDistrict._id,
            };
            const response = await getVacancies(params);
            setVacancies(response.data || []);
        } catch (error) {
            console.error("Error fetching vacancies:", error);
        }
    };

    const handleDeleteVacancy = async (e, vacancyId) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this vacancy?")) {
            try {
                await deleteVacancy(vacancyId);
                toast.success("Vacancy deleted");
                fetchVacancies();
            } catch (error) {
                console.error("Error deleting vacancy:", error);
                toast.error("Failed to delete vacancy");
            }
        }
    };

    const handleEditVacancy = (vacancy) => {
        setEditingVacancy(vacancy);
        const vacancyPosition = positions.find(p => p.name === vacancy.position);
        setCurrentPosition(vacancyPosition || null);
        setVacancyData({
            title: vacancy.title,
            count: vacancy.count,
            experience: vacancy.experience,
            skills: vacancy.skills.length > 0 ? vacancy.skills : [''],
            education: vacancy.education,
            certifications: vacancy.certifications,
            deadline: vacancy.deadline ? new Date(vacancy.deadline).toISOString().split('T')[0] : '',
            jobType: vacancy.jobType,
            description: vacancy.description,
            responsibilities: vacancy.responsibilities,
            salary: vacancy.salary || '',
            joiningDate: vacancy.joiningDate ? new Date(vacancy.joiningDate).toISOString().split('T')[0] : ''
        });
        setCurrentStep('vacancyForm');
    };

    // --- FORM HANDLERS ---
    const handleSkillChange = (index, value) => {
        const newSkills = [...vacancyData.skills];
        newSkills[index] = value;
        setVacancyData({ ...vacancyData, skills: newSkills });
    };

    const addSkillField = () => {
        setVacancyData({ ...vacancyData, skills: [...vacancyData.skills, ''] });
    };

    const removeSkillField = (index) => {
        const newSkills = vacancyData.skills.filter((_, i) => i !== index);
        setVacancyData({ ...vacancyData, skills: newSkills.length > 0 ? newSkills : [''] });
    };

    const saveVacancy = async () => {
        if (!currentPosition) return toast.error('Select Position');
        if (!vacancyData.title.trim()) return toast.error('Enter vacancy title');
        if (!currentCountry || !currentState || !currentCluster || !currentDistrict || selectedCities.length === 0) {
            return toast.error('Please select Country, State, Cluster, District, and Cities');
        }

        const payload = {
            ...vacancyData,
            department: currentPosition.department, // Use designation's bound department
            position: currentPosition.name,
            country: currentCountry._id,
            state: currentState._id,
            cluster: currentCluster._id,
            district: currentDistrict._id,
            cities: selectedCities.map(c => c._id),
            skills: vacancyData.skills.filter(s => s.trim() !== '')
        };

        try {
            setIsSaving(true);
            if (editingVacancy) {
                await updateVacancy(editingVacancy._id, payload);
                toast.success("Vacancy updated successfully");
            } else {
                await createVacancy(payload);
                toast.success("Vacancy created successfully");
            }
            setEditingVacancy(null);
            fetchVacanciesInScope();
            setVacancyData({
                title: '', count: 1, experience: '', skills: [''], education: '',
                certifications: '', deadline: '', jobType: 'fulltime',
                description: '', responsibilities: '', salary: '', joiningDate: ''
            });
            setCurrentPosition(null);
        } catch (error) {
            console.error("Error saving vacancy:", error);
            const errorMsg = error.message || (typeof error === 'string' ? error : "Failed to save vacancy");
            toast.error(errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    // --- CANDIDATE HANDLERS ---
    const openCandidateModal = (vacancy) => {
        setSelectedVacancyForCandidate(vacancy);
        setCandidateFormData({ name: '', mobile: '', email: '' });
        setGeneratedCredentials(null);
        setShowCandidateModal(true);
    };

    const handleAddCandidateSubmit = async (e) => {
        e.preventDefault();
        if (!candidateFormData.name.trim() || !candidateFormData.mobile.trim()) {
            return toast.error("Name and Mobile number are required.");
        }
        try {
            setIsAddingCandidate(true);
            const response = await addCandidate(selectedVacancyForCandidate._id, candidateFormData);
            setGeneratedCredentials(response.credentials);
            toast.success("Candidate created successfully!");
        } catch (error) {
            console.error("Error adding candidate:", error);
            toast.error(error.message || "Failed to add candidate");
        } finally {
            setIsAddingCandidate(false);
        }
    };

    const openCandidatesListModal = async (vacancy) => {
        setSelectedVacancyForCandidate(vacancy);
        setShowCandidatesListModal(true);
        setIsLoadingCandidates(true);
        try {
            const res = await getCandidatesByVacancy(vacancy._id);
            setCandidatesList(res.data || []);
        } catch (error) {
            console.error("Error fetching candidates:", error);
            toast.error("Failed to load candidates");
        } finally {
            setIsLoadingCandidates(false);
        }
    };

    const handleStatusChange = async (candidateId, newStatus) => {
        try {
            await updateCandidateStatus(candidateId, newStatus);
            toast.success(`Status updated to ${newStatus}`);
            // Update local state
            setCandidatesList(candidatesList.map(c =>
                c._id === candidateId ? { ...c, status: newStatus } : c
            ));
        } catch (error) {
            toast.error(error.message || "Failed to update status");
        }
    };

    const handleDeleteCandidate = async (candidateId) => {
        if (!window.confirm("Are you sure you want to delete this candidate? This action cannot be undone.")) return;

        try {
            await deleteCandidate(candidateId);
            toast.success("Candidate deleted successfully");
            setCandidatesList(candidatesList.filter(c => c._id !== candidateId));
        } catch (error) {
            toast.error(error.message || "Failed to delete candidate");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg p-4 shadow-lg">
                    <div className="flex items-center">
                        <Briefcase className="h-8 w-8 text-white mr-3" />
                        <h1 className="text-2xl font-bold text-white">Vacancy Module</h1>
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
                            <div className="mt-6 text-right">
                                <button onClick={handleProceedToForm} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Next: Create Vacancy</button>
                            </div>
                        )}
                    </div>
                )}

                {/* Custom Vacancy Form */}
                {currentStep === 'vacancyForm' && (
                    <div className="bg-white rounded-xl shadow-lg p-0 mt-6 overflow-hidden max-w-4xl mx-auto">
                        <div className="bg-blue-900 border-b px-6 py-4 flex justify-between items-center">
                            <h4 className="text-lg font-bold text-white flex items-center">
                                <Plus className="w-5 h-5 mr-2" />
                                {editingVacancy ? 'Edit Vacancy' : 'Post New Vacancy'}
                            </h4>
                            <button
                                onClick={() => {
                                    setEditingVacancy(null);
                                    setCurrentStep('city');
                                }}
                                className="text-white opacity-70 hover:opacity-100 flex items-center text-sm font-medium transition-opacity"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Cities
                            </button>
                        </div>
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Position & Title */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Position *</label>
                                        <select
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50"
                                            value={currentPosition?._id || ''}
                                            onChange={(e) => {
                                                const pos = positions.find(p => p._id === e.target.value);
                                                setCurrentPosition(pos || null);
                                                if (pos) {
                                                    setVacancyData({ ...vacancyData, title: pos.name });
                                                }
                                            }}
                                        >
                                            <option value="">-- Choose Position --</option>
                                            {positions.map(p => (
                                                <option key={p._id} value={p._id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Vacancies *</label>
                                        <div className="relative">
                                            <Users className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                value={vacancyData.count}
                                                onChange={(e) => setVacancyData({ ...vacancyData, count: parseInt(e.target.value) || 1 })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Salary</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. $50,000 - $70,000"
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            value={vacancyData.salary}
                                            onChange={(e) => setVacancyData({ ...vacancyData, salary: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Job Type</label>
                                            <select
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                value={vacancyData.jobType}
                                                onChange={(e) => setVacancyData({ ...vacancyData, jobType: e.target.value })}
                                            >
                                                <option value="fulltime">Full Time</option>
                                                <option value="parttime">Part Time</option>
                                                <option value="contract">Contract</option>
                                                <option value="internship">Internship</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Joining Date</label>
                                            <div className="relative">
                                                <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                                <input
                                                    type="date"
                                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                                                    value={vacancyData.joiningDate}
                                                    onChange={(e) => setVacancyData({ ...vacancyData, joiningDate: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Details & Requirements */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Job Description</label>
                                        <textarea
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[100px]"
                                            rows="4"
                                            placeholder="Enter detailed job description..."
                                            value={vacancyData.description}
                                            onChange={(e) => setVacancyData({ ...vacancyData, description: e.target.value })}
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Application Deadline</label>
                                        <div className="relative">
                                            <Clock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                            <input
                                                type="date"
                                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                value={vacancyData.deadline}
                                                onChange={(e) => setVacancyData({ ...vacancyData, deadline: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                            <ListChecks className="w-4 h-4 mr-1 text-blue-600" /> Required Skills
                                        </label>
                                        {vacancyData.skills.map((skill, index) => (
                                            <div key={index} className="flex mb-2">
                                                <input
                                                    type="text"
                                                    className="flex-1 px-4 py-2 border rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                                                    placeholder="e.g. React.js, Management"
                                                    value={skill}
                                                    onChange={(e) => handleSkillChange(index, e.target.value)}
                                                />
                                                <button
                                                    onClick={() => removeSkillField(index)}
                                                    className="px-3 bg-red-50 text-red-500 border border-l-0 border-red-100 rounded-r-lg hover:bg-red-100 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={addSkillField}
                                            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center mt-1"
                                        >
                                            <Plus className="w-4 h-4 mr-1" /> Add Skill
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setEditingVacancy(null);
                                        setCurrentStep('city');
                                    }}
                                    className="px-6 py-2.5 border rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveVacancy}
                                    disabled={isSaving}
                                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center shadow-lg shadow-blue-200"
                                >
                                    {isSaving ? (
                                        <Loader className="w-5 h-5 animate-spin mr-2" />
                                    ) : (
                                        <Save className="w-5 h-5 mr-2" />
                                    )}
                                    {editingVacancy ? 'Update Vacancy' : 'Create Vacancy'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Vacancies Table List */}
                {currentStep === 'vacancyForm' && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mt-8 overflow-hidden max-w-6xl mx-auto">
                        <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                            <Briefcase className="w-6 h-6 mr-2 text-blue-600" /> Created Vacancies in {currentDistrict?.name}
                        </h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                                        <th className="p-4 border-b font-semibold rounded-tl-lg">Position</th>
                                        <th className="p-4 border-b font-semibold">Location</th>
                                        <th className="p-4 border-b font-semibold">Openings</th>
                                        <th className="p-4 border-b font-semibold">Salary</th>
                                        <th className="p-4 border-b font-semibold">Joining Date</th>
                                        <th className="p-4 border-b font-semibold">Job Type</th>
                                        <th className="p-4 border-b font-semibold rounded-tr-lg">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vacancies.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="p-8 text-center text-gray-500 border-b">
                                                No vacancies have been created in this district yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        vacancies.map(v => (
                                            <tr key={v._id} className="border-b hover:bg-gray-50 transition-colors group">
                                                <td className="p-4 font-bold text-gray-800">{v.title}</td>
                                                <td className="p-4 text-sm text-gray-600 max-w-[150px] truncate" title={cities.filter(c => v.cities?.includes(c._id)).map(c => c.name).join(', ')}>
                                                    {cities.filter(c => v.cities?.includes(c._id)).map(c => c.name).join(', ') || 'Multiple Cities'}
                                                </td>
                                                <td className="p-4">
                                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">{v.count}</span>
                                                </td>
                                                <td className="p-4 text-sm text-gray-700 font-medium">{v.salary || 'N/A'}</td>
                                                <td className="p-4 text-sm text-gray-700">{v.joiningDate ? new Date(v.joiningDate).toLocaleDateString() : 'N/A'}</td>
                                                <td className="p-4">
                                                    <span className="capitalize px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                                                        {v.jobType}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            className="px-3 py-1.5 bg-blue-600 text-white rounded shadow-sm text-xs font-bold hover:bg-blue-700 transition"
                                                            onClick={() => openCandidateModal(v)}
                                                        >
                                                            + Candidate
                                                        </button>
                                                        <button
                                                            className="px-3 py-1.5 border border-blue-600 text-blue-600 rounded shadow-sm text-xs font-bold hover:bg-blue-50 transition"
                                                            onClick={() => openCandidatesListModal(v)}
                                                            title="View Candidates"
                                                        >
                                                            <Users className="w-4 h-4 inline-block -mt-0.5" />
                                                        </button>
                                                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition" title="Edit" onClick={() => handleEditVacancy(v)}>
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-1.5 text-red-600 hover:bg-red-50 rounded transition" title="Delete" onClick={(e) => handleDeleteVacancy(e, v._id)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Candidate Modal Overlay */}
                {showCandidateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                            <div className="bg-blue-900 border-b px-6 py-4 flex justify-between items-center">
                                <h4 className="text-lg font-bold text-white flex items-center">
                                    <Users className="w-5 h-5 mr-2" />
                                    Add Candidate
                                </h4>
                                <button
                                    onClick={() => setShowCandidateModal(false)}
                                    className="text-white opacity-70 hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6">
                                {!generatedCredentials ? (
                                    <form onSubmit={handleAddCandidateSubmit}>
                                        <div className="mb-4">
                                            <h5 className="font-semibold text-gray-700 text-sm mb-4">
                                                Applying for: <span className="text-blue-600">{selectedVacancyForCandidate?.title}</span>
                                            </h5>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Candidate Name *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                    value={candidateFormData.name}
                                                    onChange={(e) => setCandidateFormData({ ...candidateFormData, name: e.target.value })}
                                                    placeholder="Enter full name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Number (Login ID) *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                    value={candidateFormData.mobile}
                                                    onChange={(e) => setCandidateFormData({ ...candidateFormData, mobile: e.target.value })}
                                                    placeholder="Enter mobile number"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address (Optional)</label>
                                                <input
                                                    type="email"
                                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                    value={candidateFormData.email}
                                                    onChange={(e) => setCandidateFormData({ ...candidateFormData, email: e.target.value })}
                                                    placeholder="Enter email address"
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-8 flex justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowCandidateModal(false)}
                                                className="px-5 py-2 border rounded-lg hover:bg-gray-50 font-medium"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isAddingCandidate}
                                                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center"
                                            >
                                                {isAddingCandidate ? <Loader className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                                                Save Candidate
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="w-8 h-8 text-green-600" />
                                        </div>
                                        <h4 className="text-2xl font-bold text-gray-800 mb-2">Candidate Added!</h4>
                                        <p className="text-gray-600 mb-6">Generated login credentials for {candidateFormData.name}.</p>

                                        <div className="bg-gray-50 border rounded-xl p-4 mb-6 text-left">
                                            <div className="mb-3">
                                                <span className="block text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Login ID (Mobile)</span>
                                                <span className="block font-mono text-gray-800 font-medium text-lg bg-gray-200 px-3 py-1 rounded inline-block">{generatedCredentials.loginId}</span>
                                            </div>
                                            <div className="mb-3">
                                                <span className="block text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Password</span>
                                                <span className="block font-mono text-gray-800 font-medium text-lg bg-yellow-100 px-3 py-1 rounded border border-yellow-200 inline-block">{generatedCredentials.password}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Candidate Portal Link</span>
                                                <div className="flex">
                                                    <input
                                                        readOnly
                                                        value={generatedCredentials.loginLink}
                                                        className="flex-1 bg-white border border-r-0 rounded-l leading-none text-xs text-blue-600 px-2 outline-none p-1.5"
                                                    />
                                                    <button
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 border border-blue-600 rounded-r text-xs font-semibold flex flex-col justify-center"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(`Login URL: ${generatedCredentials.loginLink}\nLogin ID: ${generatedCredentials.loginId}\nPassword: ${generatedCredentials.password}`);
                                                            toast.success("Credentials copied to clipboard!");
                                                        }}
                                                    >
                                                        Copy All
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setShowCandidateModal(false)}
                                            className="w-full py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-bold"
                                        >
                                            Close
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Candidates List Modal */}
                {showCandidatesListModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up">
                            <div className="bg-blue-900 border-b px-6 py-4 flex justify-between items-center shrink-0">
                                <h4 className="text-lg font-bold text-white flex items-center">
                                    <ClipboardList className="w-5 h-5 mr-2" />
                                    Candidates for: {selectedVacancyForCandidate?.title}
                                </h4>
                                <button
                                    onClick={() => setShowCandidatesListModal(false)}
                                    className="text-white opacity-70 hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1">
                                {isLoadingCandidates ? (
                                    <div className="flex justify-center p-8">
                                        <Loader className="animate-spin text-blue-600 h-8 w-8" />
                                    </div>
                                ) : candidatesList.length === 0 ? (
                                    <div className="text-center p-8 text-gray-500">
                                        No candidates applied for this vacancy yet.
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                                                <th className="p-3 border-b font-semibold rounded-tl-lg">Name</th>
                                                <th className="p-3 border-b font-semibold">Mobile</th>
                                                <th className="p-3 border-b font-semibold">Pref. Join Date</th>
                                                <th className="p-3 border-b font-semibold">Applied On</th>
                                                <th className="p-3 border-b font-semibold">Track Status</th>
                                                <th className="p-3 border-b font-semibold rounded-tr-lg">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {candidatesList.map(candidate => (
                                                <tr key={candidate._id} className="border-b hover:bg-gray-50 transition-colors">
                                                    <td className="p-3 font-medium text-gray-800">{candidate.name}</td>
                                                    <td className="p-3 text-sm text-gray-600">{candidate.mobile}</td>
                                                    <td className="p-3 text-sm text-gray-600">
                                                        {candidate.preferredJoiningDate ? new Date(candidate.preferredJoiningDate).toLocaleDateString() : '-'}
                                                    </td>
                                                    <td className="p-3 text-sm text-gray-500">
                                                        {new Date(candidate.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-3">
                                                        <select
                                                            value={candidate.status}
                                                            onChange={(e) => handleStatusChange(candidate._id, e.target.value)}
                                                            className={`border rounded px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${candidate.status === 'Joined' ? 'bg-green-100 text-green-800 border-green-300' :
                                                                candidate.status === 'Rejected' ? 'bg-red-100 text-red-800 border-red-300' :
                                                                    candidate.status === 'Selected' ? 'bg-indigo-100 text-indigo-800 border-indigo-300' :
                                                                        candidate.status === 'Applied' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                                                            'bg-gray-100 text-gray-800 border-gray-300'
                                                                }`}
                                                        >
                                                            {statusOptions.map(opt => (
                                                                <option key={opt} value={opt}>{opt}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex justify-start">
                                                            <button
                                                                onClick={() => handleDeleteCandidate(candidate._id)}
                                                                className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 hover:text-red-700 transition"
                                                                title="Delete Candidate"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VacancySetting;
