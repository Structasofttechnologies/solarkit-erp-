import React, { useState, useEffect } from 'react';
import {
    Home,
    Building2,
    Factory,
    Filter,
    X,
    ChevronRight,
    Sun,
    Zap,
    Battery,
    ArrowRight,
    MapPin,
    CheckCircle,
    Settings,
    List
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLocations } from '../../../../hooks/useLocations';
import { getDiscomsByState } from '../../../../services/quote/quoteApi';
import { projectApi } from '../../../../services/project/projectApi';
import { getSubCategories } from '../../../../services/core/masterApi';


const AdminProjectManagement = () => {
    const navigate = useNavigate();
    const { entityType } = useParams();
    
    // Capitalize for display
    const entityLabel = entityType ? entityType.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') : 'Company';
    // State for filters
    const [filters, setFilters] = useState({
        category: '',
        subCategory: '',
        projectType: '',
        subProjectType: ''
    });

    // New location-based filters
    const { states } = useLocations();
    const [selectedStateId, setSelectedStateId] = useState('');
    const [discoms, setDiscoms] = useState([]);
    const [selectedDiscomId, setSelectedDiscomId] = useState('');
    const [loadingDiscoms, setLoadingDiscoms] = useState(false);
    const [allConfigs, setAllConfigs] = useState([]);
    const [matchingConfig, setMatchingConfig] = useState(null);
    const [matchingConfigs, setMatchingConfigs] = useState([]);

    // State for selected customer type
    const [selectedCustomerType, setSelectedCustomerType] = useState(null);
    const [masterSubCategories, setMasterSubCategories] = useState([]);


    // Fetch all configs once
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [configData, subCatsData] = await Promise.all([
                    projectApi.getConfigurations(),
                    getSubCategories()
                ]);
                setAllConfigs(configData || []);
                setMasterSubCategories(subCatsData?.data || (Array.isArray(subCatsData) ? subCatsData : []));
            } catch (error) {
                console.error("Error fetching initial data:", error);
            }
        };
        fetchInitialData();

    }, []);

    // Fetch discoms when state changes
    useEffect(() => {
        if (selectedStateId) {
            const fetchDiscoms = async () => {
                setLoadingDiscoms(true);
                try {
                    const response = await getDiscomsByState(selectedStateId);
                    // Handle both raw array and { success: true, data: [] } formats
                    const dArr = Array.isArray(response) ? response : (response?.data || []);
                    setDiscoms(dArr);
                } catch (error) {
                    console.error("Error fetching discoms:", error);
                } finally {
                    setLoadingDiscoms(false);
                }
            };
            fetchDiscoms();
            setSelectedDiscomId(''); // Reset discom when state changes
        } else {
            setDiscoms([]);
            setSelectedDiscomId('');
        }
    }, [selectedStateId]);

    // Filter options
    const filterOptions = {
        categories: [
            { value: 'Rooftop Solar', label: 'Rooftop Solar' },
            { value: 'Solar Pump', label: 'Solar Pump' }
        ],
        subCategories: [
            { value: 'Residential', label: 'Residential' },
            { value: 'Commercial', label: 'Commercial' }
        ],
        projectTypes: [
            { value: '1 to 10 kW', label: '1 to 10 kW' },
            { value: '11 to 20 kW', label: '11 to 20 kW' }
        ],
        subProjectTypes: [
            { value: 'On-Grid', label: 'On-Grid' },
            { value: 'Off-Grid', label: 'Off-Grid' },
            { value: 'Hybrid', label: 'Hybrid' }
        ]
    };

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));

        // Auto-hide cards based on sub-category selection
        if (name === 'subCategory') {
            if (value === 'Residential') {
                setSelectedCustomerType('Residential');
            } else if (value === 'Commercial') {
                setSelectedCustomerType('Commercial');
            } else {
                setSelectedCustomerType(null);
            }
        }
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            category: '',
            subCategory: '',
            projectType: '',
            subProjectType: ''
        });
        setSelectedStateId('');
        setSelectedDiscomId('');
        setSelectedCustomerType(null);
    };

    // Find matching configuration
    useEffect(() => {
        if (selectedStateId && selectedDiscomId && selectedCustomerType) {
            const sArr = Array.isArray(states) ? states : (states?.data || []);
            const dArr = Array.isArray(discoms) ? discoms : (discoms?.data || []);
            
            const stateName = sArr.find(s => s._id === selectedStateId)?.name;
            const discomName = dArr.find(d => d._id === selectedDiscomId)?.name;

            if (stateName && discomName) {
                const foundConfigs = allConfigs.filter(cfg => {
                    const val = cfg.configValue;
                    if (!val) return false;

                    const stateMatch = Array.isArray(val.currentState) 
                        ? val.currentState.includes(stateName)
                        : val.currentState === stateName;
                    
                    const discomMatch = Array.isArray(val.currentDiscom)
                        ? val.currentDiscom.includes(discomName)
                        : val.currentDiscom === discomName;
                    
                    const categoryMatch = val.configCategory === selectedCustomerType;
                    const appliesToType = (val.allKeys || []).some(key => key.includes(selectedCustomerType));
                    const keyMatch = (cfg.configKey || '').includes(selectedCustomerType);

                    return stateMatch && discomMatch && (categoryMatch || appliesToType || keyMatch);
                });
                
                // Group by name and steps to avoid duplicates in display
                const uniqueGroups = {};
                foundConfigs.forEach(cfg => {
                    const val = cfg.configValue;
                    if (!val) return;
                    const stepsKey = (val.selectedSteps || []).join('|');
                    const uniqueKey = `${val.configName || 'unnamed'}-${stepsKey}`;
                    
                    if (!uniqueGroups[uniqueKey]) {
                        uniqueGroups[uniqueKey] = cfg;
                    } else {
                        // Keep the newest one if multiple match
                        const currentNewest = new Date(uniqueGroups[uniqueKey].createdAt || uniqueGroups[uniqueKey].updatedAt || 0);
                        const thisOne = new Date(cfg.createdAt || cfg.updatedAt || 0);
                        if (thisOne > currentNewest) {
                            uniqueGroups[uniqueKey] = cfg;
                        }
                    }
                });

                const finalConfigs = Object.values(uniqueGroups);
                setMatchingConfigs(finalConfigs);
                if (finalConfigs.length > 0) {
                    const sorted = [...finalConfigs].sort((a,b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt));
                    setMatchingConfig(sorted[0]);
                } else {
                    setMatchingConfig(null);
                }
            }
        } else {
            setMatchingConfigs([]);
            setMatchingConfig(null);
        }
    }, [selectedStateId, selectedDiscomId, selectedCustomerType, allConfigs, states, discoms]);

    // Handle customer type selection
    const handleCustomerTypeSelect = (type) => {
        setSelectedCustomerType(type);
    };

    // Handle continue button click
    const handleContinue = () => {
        if (selectedCustomerType) {
            const params = new URLSearchParams({
                stateId: selectedStateId,
                discomId: selectedDiscomId,
                customerType: selectedCustomerType
            }).toString();

            // Determine route based on type
            const pathName = (selectedCustomerType.toLowerCase() === 'residential' || selectedCustomerType.toLowerCase() === 'commercial')
                ? `${selectedCustomerType.toLowerCase()}-project`
                : 'residential-project'; // Defaulting to residential journey for others

            navigate(`/admin/${pathName}?${params}&entityType=${entityType}`);
        }
    };


    // Check if continue button should be enabled
    const isContinueEnabled = selectedCustomerType !== null && selectedStateId !== '' && selectedDiscomId !== '';

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm mb-6 border border-gray-100">
                    <div className="p-4 flex justify-between items-center">
                        <h4 className="text-blue-600 font-bold text-lg flex items-center gap-2">
                            <Settings size={20} />
                            Project Management ({entityLabel})
                        </h4>
                        {(selectedStateId || selectedDiscomId || selectedCustomerType) && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                            >
                                <X size={14} /> Clear All
                            </button>
                        )}
                    </div>
                </div>

                {/* State Selection Section */}
                <div className="mb-8">
                    <h4 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
                        <MapPin className="mr-2 text-blue-500" size={24} />
                        1. Select State
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {states.length > 0 ? (
                            states.map((state, index) => (
                                <div
                                    key={state._id}
                                    className={`cursor-pointer rounded-xl shadow-sm transition-all duration-300 transform hover:-translate-y-1 border-2 p-5 text-center ${selectedStateId === state._id
                                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100 shadow-md'
                                        : 'border-gray-100 bg-white hover:border-blue-200'
                                        }`}
                                    onClick={() => setSelectedStateId(state._id)}
                                >
                                    <div className={`text-lg font-bold ${selectedStateId === state._id ? 'text-blue-600' : 'text-gray-700'}`}>
                                        {state.name}
                                    </div>
                                    <div className={`mt-2 text-xs font-medium ${selectedStateId === state._id ? 'text-blue-500' : 'text-gray-400'}`}>
                                        {selectedStateId === state._id ? (
                                            <span className="flex items-center justify-center gap-1">
                                                <CheckCircle size={12} /> Selected
                                            </span>
                                        ) : 'Click to select'}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-500">
                                No states available.
                            </div>
                        )}
                    </div>
                </div>

                {/* Discom Selection Section */}
                {selectedStateId && (
                    <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        <h4 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
                            <Building2 className="mr-2 text-blue-500" size={24} />
                            2. Select Discom
                        </h4>
                        {loadingDiscoms ? (
                            <div className="flex justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : discoms.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {discoms.map((discom) => (
                                    <div
                                        key={discom._id}
                                        className={`cursor-pointer rounded-xl shadow-sm transition-all duration-300 transform hover:-translate-y-1 border-2 p-5 text-center ${selectedDiscomId === discom._id
                                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100 shadow-md'
                                            : 'border-gray-100 bg-white hover:border-blue-200'
                                            }`}
                                        onClick={() => setSelectedDiscomId(discom._id)}
                                    >
                                        <div className={`text-lg font-bold ${selectedDiscomId === discom._id ? 'text-blue-600' : 'text-gray-700'}`}>
                                            {discom.name}
                                        </div>
                                        <div className={`mt-2 text-xs font-medium ${selectedDiscomId === discom._id ? 'text-blue-500' : 'text-gray-400'}`}>
                                            {selectedDiscomId === discom._id ? (
                                                <span className="flex items-center justify-center gap-1">
                                                    <CheckCircle size={12} /> Selected
                                                </span>
                                            ) : 'Click to select'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-center text-orange-600 font-medium">
                                No Discoms found for this state.
                            </div>
                        )}
                    </div>
                )}

                {/* Old Filter Section (Commented Out) */}
                {/* 
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <select
                                    name="category"
                                    value={filters.category}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Filter by Category</option>
                                    {filterOptions.categories.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <select
                                    name="subCategory"
                                    value={filters.subCategory}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Filter by Sub-Category</option>
                                    {filterOptions.subCategories.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <select
                                    name="projectType"
                                    value={filters.projectType}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Filter by Project Type</option>
                                    {filterOptions.projectTypes.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <select
                                    name="subProjectType"
                                    value={filters.subProjectType}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Filter by Sub Project Type</option>
                                    {filterOptions.subProjectTypes.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end mt-4">
                            <button
                                onClick={clearFilters}
                                className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 text-sm flex items-center"
                            >
                                <X size={16} className="mr-1" />
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
                */}

                {/* Customer Type Selection */}
                <div className={`text-center mt-8 transition-all duration-500 ${!selectedDiscomId ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                    <h3 className="text-blue-600 font-bold text-2xl mb-2">3. Select Configuration Type</h3>
                    <p className="text-gray-500 mb-6 font-medium">Choose between Residential or Commercial workflow</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {masterSubCategories.map((sub) => {
                            const isSelected = selectedCustomerType === sub.name;
                            const Icon = sub.name === 'Residential' ? Home : (sub.name === 'Commercial' ? Building2 : Factory);
                            
                            return (
                                <div
                                    key={sub._id}
                                    onClick={() => handleCustomerTypeSelect(sub.name)}
                                    className={`cursor-pointer transition-all duration-300 transform rounded-2xl shadow-sm border-2 p-6 text-center ${isSelected
                                        ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-50 scale-[1.05] shadow-xl'
                                        : 'border-gray-100 bg-white hover:border-blue-300 hover:shadow-lg'
                                        }`}
                                >
                                    <div className={`w-16 h-16 mx-auto mb-4 border rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-50 text-blue-500 border-blue-100'}`}>
                                        <Icon size={32} />
                                    </div>
                                    <h4 className={`font-black text-lg mb-1 ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                                        {sub.name}
                                    </h4>
                                    <p className="text-gray-400 text-xs font-medium truncate">
                                        {sub.name === 'Residential' ? 'For personal use' : 
                                         sub.name === 'Commercial' ? 'For business use' : 'Standard journey'}
                                    </p>
                                </div>
                            );
                        })}
                    </div>


                    {/* Continue Button */}
                    <button
                        onClick={handleContinue}
                        disabled={!isContinueEnabled}
                        className={`mt-12 px-10 py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center mx-auto transition-all shadow-lg ${isContinueEnabled
                            ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200 transform hover:-translate-y-1'
                            : 'bg-gray-300 cursor-not-allowed'
                            }`}
                    >
                        Continue to Project Journey
                        <ArrowRight size={20} className="ml-2" />
                    </button>
                </div>

                {/* Workflow Data Section */}
                {matchingConfig && (
                    <div className="mt-12 animate-in zoom-in-95 duration-500">
                        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
                            <div className="bg-blue-600 p-6 text-white">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <List size={24} />
                                            {matchingConfigs.length > 1 
                                                ? `Available Workflow Configurations (${matchingConfigs.length})` 
                                                : `Workflow Configuration: ${matchingConfig.configValue?.configName || 'Unnamed'}`
                                            }
                                        </h3>
                                        <p className="text-blue-100 text-sm mt-1">
                                            {matchingConfigs.length > 1 
                                                ? `Viewing ${matchingConfig.configValue?.configName || 'Latest'} - Click to switch below`
                                                : `Applied Workflow Steps for ${selectedCustomerType}`
                                            }
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        {matchingConfigs.length > 1 && (
                                            <select 
                                                className="bg-white/10 border border-white/20 rounded px-2 py-1 text-xs font-bold outline-none cursor-pointer"
                                                value={matchingConfig?._id}
                                                onChange={(e) => setMatchingConfig(matchingConfigs.find(c => c._id === e.target.value))}
                                            >
                                                {matchingConfigs.map(c => (
                                                    <option key={c._id} value={c._id} className="text-gray-800">{c.configValue?.configName || 'Unnamed'}</option>
                                                ))}
                                            </select>
                                        )}
                                        <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                                            <span className="text-xs uppercase font-bold tracking-wider">Status</span>
                                            <div className="text-sm font-bold flex items-center gap-1">
                                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                Active
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="flex flex-wrap gap-4 items-center">
                                    {(matchingConfig?.configValue?.selectedSteps || []).map((step, idx) => (
                                        <React.Fragment key={idx}>
                                            <div className="flex flex-col items-center group">
                                                <div className="w-12 h-12 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-600 font-bold shadow-sm transition-all group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600">
                                                    {idx + 1}
                                                </div>
                                                <span className="mt-2 text-sm font-semibold text-gray-700">{step}</span>
                                            </div>
                                            {idx < matchingConfig.configValue.selectedSteps.length - 1 && (
                                                <div className="h-0.5 w-8 bg-gray-200 hidden md:block mt-[-20px]"></div>
                                            )}
                                        </React.Fragment>
                                    ))}
                                    {matchingConfig.configValue?.selectedSteps?.length === 0 && (
                                        <p className="text-gray-400 italic">No steps defined for this configuration.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Fallback if no config found */}
                {selectedDiscomId && selectedCustomerType && !matchingConfig && (
                    <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6 text-center animate-in fade-in duration-500">
                        <p className="text-amber-700 font-medium">
                            No custom workflow found for this selection. The default journey will be used.
                        </p>
                        <button 
                            onClick={() => navigate('/admin/settings/project/configuration-setting')}
                            className="text-blue-600 underline text-sm mt-2 hover:text-blue-800"
                        >
                            Configure Workflow Steps
                        </button>
                    </div>
                )}

                {/* Summary of Selections (Optional - for better UX) */}
                {(filters.category || filters.subCategory || filters.projectType || filters.subProjectType || selectedCustomerType) && (
                    <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h5 className="font-semibold text-blue-700 mb-2">Current Selections:</h5>
                        <div className="flex flex-wrap gap-2">
                            {filters.category && (
                                <span className="px-2 py-1 bg-white text-blue-600 text-sm rounded-full border border-blue-200">
                                    Category: {filters.category}
                                </span>
                            )}
                            {filters.subCategory && (
                                <span className="px-2 py-1 bg-white text-blue-600 text-sm rounded-full border border-blue-200">
                                    Sub-Category: {filters.subCategory}
                                </span>
                            )}
                            {filters.projectType && (
                                <span className="px-2 py-1 bg-white text-blue-600 text-sm rounded-full border border-blue-200">
                                    Project Type: {filters.projectType}
                                </span>
                            )}
                            {filters.subProjectType && (
                                <span className="px-2 py-1 bg-white text-blue-600 text-sm rounded-full border border-blue-200">
                                    Sub Project Type: {filters.subProjectType}
                                </span>
                            )}
                            {selectedCustomerType && (
                                <span className="px-2 py-1 bg-white text-blue-600 text-sm rounded-full border border-blue-200">
                                    Customer Type: {selectedCustomerType}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminProjectManagement;
