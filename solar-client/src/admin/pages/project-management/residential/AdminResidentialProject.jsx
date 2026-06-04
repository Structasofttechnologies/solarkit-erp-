import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Search,
    User,
    Phone,
    Mail,
    MapPin,
    Navigation,
    CheckSquare,
    FileText,
    Check,
    File,
    Download,
    Eye,
    MoreVertical,
    RefreshCw,
    UserPlus,
    X,
    Upload,
    Clipboard,
    Zap,
    Calculator,
    Map,
    CreditCard,
    ThumbsUp,
    IndianRupee,
    Calendar,
    Clock,
    Award,
    Settings,
    Wrench,
    PenSquare,
    Activity,
    Home,
    FileCheck,
    FileSignature,
    FileSpreadsheet,
    FileImage,
    FileOutput,
    FileInput,
    FileDigit,
    FileScan,
    FileWarning,
    FileX,
    FileCheck2,
    FileClock,
    FileCog,
    FileBadge,
    FileCode,
    FileDiff,
    FileHeart,
    FileLock,
    FileMinus,
    FilePlus,
    FileQuestion,
    FileSearch,
    FileSymlink,
    FileTerminal,
    FileType,
    FileUp,
    FileVideo,
    FileVolume,
    FileVolume2,
    FileWarning as FileWarningIcon,
    Folder,
    FolderCheck,
    FolderClock,
    FolderClosed,
    FolderCog,
    FolderDot,
    FolderDown,
    FolderGit,
    FolderGit2,
    FolderHeart,
    FolderInput,
    FolderKanban,
    FolderKey,
    FolderLock,
    FolderMinus,
    FolderOpen,
    FolderOpenDot,
    FolderOutput,
    FolderPlus,
    FolderRoot,
    FolderSearch,
    FolderSearch2,
    FolderSymlink,
    FolderSync,
    FolderTree,
    FolderUp,
    FolderX,
    Building2,
    Factory,
    Warehouse,
    Store,
    Briefcase,
    FileBarChart,
    FileSpreadsheet as FileSpreadsheetIcon,
    FileSignature as FileSignatureIcon,
    FileCheck as FileCheckIcon,
    FileClock as FileClockIcon,
    FileCog as FileCogIcon,
    FileDiff as FileDiffIcon,
    FileDigit as FileDigitIcon,
    FileImage as FileImageIcon,
    FileOutput as FileOutputIcon,
    FilePlus as FilePlusIcon,
    FileSearch as FileSearchIcon,
    FileText as FileTextIcon,
    FileUp as FileUpIcon,
    FileVideo as FileVideoIcon,
    FileX as FileXIcon,
    List
} from 'lucide-react';

import { projectAPI } from '../../../../api/api';
import { projectApi as settingsApi } from '../../../../services/project/projectApi';
import { useLocation } from 'react-router-dom';
import * as locationApi from '../../../../services/core/locationApi';
import * as quoteApi from '../../../../services/quote/quoteApi';

const AdminResidentialProject = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const stateIdParam = queryParams.get('stateId');
    const discomIdParam = queryParams.get('discomId');

    const [currentStep, setCurrentStep] = useState(1);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showProjectForm, setShowProjectForm] = useState(false);
    const [activeTab, setActiveTab] = useState({
        dynamic: 0 // Index of the active form for dynamic steps
    });
    const [files, setFiles] = useState({});
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [journeyStages, setJourneyStages] = useState([]);
    const [configSteps, setConfigSteps] = useState([]);
    const [matchingConfig, setMatchingConfig] = useState(null);
    const [matchingConfigs, setMatchingConfigs] = useState([]);
    const [formData, setFormData] = useState({
        consumerName: '',
        consumerNumber: '',
        authorizedPersonName: '',
        mobileNumber: '',
        emailId: '',
        vendorAgreement: false,
        address: ''
    });

    const totalSteps = configSteps.length > 0 ? configSteps.length : (journeyStages.length > 0 ? journeyStages.length : 5);

    // Timeline generation based on hardcoded layout request
    const getTimelineItems = (customer) => {
        const items = [];
        
        // Add dynamic milestones if available
        if (customer?.orderId?.milestones) {
            customer.orderId.milestones.forEach(m => {
                items.push({
                    title: m.name,
                    date: m.completedAt ? new Date(m.completedAt).toLocaleDateString() : 'Pending',
                    status: m.status === 'completed' ? 'Completed' : 'Pending',
                    icon: m.status === 'completed' ? 'Check' : 'Clock',
                    color: m.status === 'completed' ? 'green' : 'blue',
                    hasPdf: m.name === 'Advance Payment' && m.status === 'completed'
                });
            });
        }

        // Hardcoded defaults for display as requested earlier
        items.push(
            {
                title: 'Service Ticket Closed',
                date: '23 Jan 2024',
                user: 'Completed by RajDeep Singh',
                icon: 'CheckSquare',
                color: 'blue'
            },
            {
                title: 'Project Completed',
                date: '24 Jan 2024',
                hasPdf: true,
                icon: 'CheckCircle',
                color: 'green'
            },
            {
                title: 'Token Amount Received',
                date: 'paid 20,000 online',
                details: '05 Jan 2024',
                icon: 'IndianRupee',
                color: 'blue'
            }
        );

        return items;
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // 1. Fetch all prerequisite data
                const [projResponse, stagesResponse, allConfigs, statesData] = await Promise.all([
                    projectAPI.getAll({ category: 'Residential' }),
                    settingsApi.getJourneyStages(),
                    settingsApi.getConfigurations(),
                    locationApi.getStates()
                ]);

                let filteredProjects = projResponse.success ? projResponse.data : [];

                // Filter projects by state if provided in URL
                if (stateIdParam) {
                    filteredProjects = filteredProjects.filter(p => p.state === stateIdParam || p.state?._id === stateIdParam);
                }

                setProjects(filteredProjects);
                if (filteredProjects.length > 0) {
                    setSelectedCustomer(filteredProjects[0]);
                }

                // Fetch Journey Stages from Backend
                if (stagesResponse && Array.isArray(stagesResponse)) {
                    setJourneyStages(stagesResponse);
                }

                // 2. Determine State and DISCOM names from params
                let stateName = '';
                let discomName = '';

                if (stateIdParam) {
                    // locationApi.getStates returns the array directly (res.data.data)
                    const sArr = Array.isArray(statesData) ? statesData : (statesData?.data || []);
                    const stateObj = sArr.find(s => s._id === stateIdParam);
                    if (stateObj) stateName = stateObj.name;
                    
                    if (discomIdParam) {
                        try {
                            const dResponse = await quoteApi.getDiscomsByState(stateIdParam);
                            // quoteApi returns response.data (which might be { success, data: [] } or just [])
                            const dArr = Array.isArray(dResponse) ? dResponse : (dResponse?.data || []);
                            const discomObj = dArr.find(d => d._id === discomIdParam);
                            if (discomObj) discomName = discomObj.name;
                        } catch (err) {
                            console.error("Error resolving discom name:", err);
                        }
                    }
                }

                // Fallback to first project
                if (!stateName && filteredProjects.length > 0) {
                    stateName = filteredProjects[0].state?.name || '';
                    discomName = filteredProjects[0].discom?.name || '';
                }

                // 3. Find ALL matching configurations
                const foundConfigs = allConfigs.filter(cfg => {
                    const val = cfg.configValue;
                    if (!val) return false;

                    const stateMatch = Array.isArray(val.currentState)
                        ? val.currentState.includes(stateName)
                        : val.currentState === stateName;

                    const discomMatch = !discomName || (Array.isArray(val.currentDiscom)
                        ? val.currentDiscom.includes(discomName)
                        : val.currentDiscom === discomName);

                    const categoryMatch = val.configCategory === 'Residential' || val.configCategory === 'Mixed';
                    const appliesToType = (val.allKeys || []).some(key => key.includes('Residential')) || (cfg.configKey || '').includes('Residential');

                    return stateMatch && discomMatch && (categoryMatch || appliesToType);
                });

                if (foundConfigs.length > 0) {
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
                    
                    // Use the newest one as per creation/update date
                    const sorted = [...finalConfigs].sort((a,b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt));
                    const latest = sorted[0];
                    setMatchingConfig(latest);
                    setConfigSteps(latest.configValue?.selectedSteps || []);
                } else {
                    setMatchingConfigs([]);
                    setMatchingConfig(null);
                    setConfigSteps([]);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [stateIdParam, discomIdParam]);

    const handleCustomerClick = (customer) => {
        setSelectedCustomer(customer);
        setCurrentStep(customer.currentStep || 1);
        // Pre-fill form if data exists
        setFormData({
            consumerName: customer.projectName || '',
            consumerNumber: customer.consumerNumber || '',
            authorizedPersonName: customer.authorizedPersonName || '',
            mobileNumber: customer.mobile || '',
            emailId: customer.email || '',
            address: customer.address || '',
            vendorAgreement: false
        });
    };

    const filteredCustomers = projects.filter(customer =>
        customer.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.projectId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const updateStep = async (newStep) => {
        // Optimistic update
        setCurrentStep(newStep);

        if (!selectedCustomer) return;

        try {
            await projectAPI.update(selectedCustomer._id, { currentStep: newStep });
            // Update local projects state to reflect the change for this customer
            setProjects(projects.map(p => p._id === selectedCustomer._id ? { ...p, currentStep: newStep } : p));
            setSelectedCustomer({ ...selectedCustomer, currentStep: newStep });
        } catch (error) {
            console.error('Error updating step:', error);
            // Revert on error if needed, but for step nav maybe not critical to revert UI immediately
        }
    };

    const handleNext = async () => {
        if (currentStep < totalSteps) {
            updateStep(currentStep + 1);
        } else {
            // Final step completion
            if (!selectedCustomer) return;
            try {
                const response = await projectAPI.update(selectedCustomer._id, { status: 'Completed' });
                if (response.success) {
                    // Update local state
                    setProjects(projects.map(p => p._id === selectedCustomer._id ? { ...p, status: 'Completed' } : p));
                    setSelectedCustomer({ ...selectedCustomer, status: 'Completed' });
                    alert('Application process completed! Project marked as Completed.');
                }
            } catch (error) {
                console.error('Error completing project:', error);
                alert('Failed to update project status.');
            }
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            updateStep(currentStep - 1);
        }
    };

    const handleStepClick = (step) => {
        updateStep(step);
    };

    const handleFileChange = (field, e) => {
        const file = e.target.files[0];
        if (file) {
            setFiles({ ...files, [field]: file });
        }
    };

    const handleRegister = async () => {
        if (!selectedCustomer) return;

        try {
            const payload = {
                projectName: formData.consumerName,
                consumerNumber: formData.consumerNumber,
                authorizedPersonName: formData.authorizedPersonName,
                mobile: formData.mobileNumber,
                email: formData.emailId,
                address: formData.address,
            };

            const response = await projectAPI.update(selectedCustomer._id, payload);
            if (response.success) {
                alert('Consumer details registered successfully!');
                // Update local state to reflect changes immediately
                setProjects(projects.map(p => p._id === selectedCustomer._id ? { ...p, ...payload } : p));
                setSelectedCustomer({ ...selectedCustomer, ...payload });
            }
        } catch (error) {
            console.error('Error registering consumer:', error);
            alert('Failed to register consumer details.');
        }
    };

    const getFileDisplayName = (field) => {
        return files[field]?.name || 'No file selected';
    };

    const getStepStatus = (step) => {
        if (step < currentStep) return 'completed';
        if (step === currentStep) return 'active';
        return '';
    };

    const getIcon = (iconName, className = "h-4 w-4") => {
        const icons = {
            CheckSquare: <CheckSquare className={className} />,
            User: <User className={className} />,
            Check: <Check className={className} />,
            FileText: <FileText className={className} />,
            Clipboard: <Clipboard className={className} />,
            Zap: <Zap className={className} />,
            Calculator: <Calculator className={className} />,
            Map: <Map className={className} />,
            CreditCard: <CreditCard className={className} />,
            ThumbsUp: <ThumbsUp className={className} />,
            IndianRupee: <IndianRupee className={className} />
        };
        return icons[iconName] || <FileText className={className} />;
    };

    // Helper for rendering dynamic inputs
    const renderDynamicInput = (input, formIndex, inputIndex) => {
        const fieldKey = `dynamic_${currentStep}_${formIndex}_${inputIndex}`;
        
        switch (input.type) {
            case 'textarea':
                return (
                    <div className="mb-4">
                        <label className="block font-bold mb-1 text-sm">{input.label}</label>
                        <textarea
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder={`Enter ${input.label}`}
                            rows={4}
                        />
                    </div>
                );
            case 'upload':
                return (
                    <FileUpload 
                        id={fieldKey} 
                        label={input.label} 
                        field={fieldKey} 
                        showLabel={true}
                    />
                );
            case 'download':
                return (
                    <div className="flex justify-between items-center p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                        <div>
                            <p className="font-bold text-blue-900">{input.label}</p>
                            <p className="text-xs text-blue-600">Available for reference</p>
                        </div>
                        <ActionButtons showView={true} />
                    </div>
                );
            case 'select':
                return (
                    <div className="mb-4">
                        <label className="block font-bold mb-1 text-sm">{input.label}</label>
                        <select className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                            <option value="">Select Option</option>
                            {input.options?.map((opt, i) => (
                                <option key={i} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>
                );
            case 'date':
                return (
                    <div className="mb-4">
                        <label className="block font-bold mb-1 text-sm">{input.label}</label>
                        <div className="relative">
                            <input
                                type="date"
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="mb-4">
                        <label className="block font-bold mb-1 text-sm">{input.label}</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder={`Enter ${input.label}`}
                        />
                    </div>
                );
        }
    };

    const renderDynamicStepContent = (stepName) => {
        const stage = journeyStages.find(s => s.name === stepName);
        
        if (!stage || !stage.fields || stage.fields.length === 0) {
            return (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <FileWarningIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-500">No Forms Configured</h3>
                    <p className="text-gray-400">This step doesn't have any dynamic forms yet.</p>
                </div>
            );
        }

        const activeFormIndex = activeTab.dynamic || 0;
        const currentForm = stage.fields[activeFormIndex] || stage.fields[0];

        return (
            <div className="wizard-step">
                <h5 className="text-blue-600 font-bold uppercase tracking-widest text-[11px] mb-4 flex items-center gap-2">
                    <Activity size={14} /> {stage.name} Stage
                </h5>

                {/* Form Tabs */}
                {stage.fields.length > 1 && (
                    <div className="border-b border-gray-200 mb-6 overflow-x-auto">
                        <div className="flex whitespace-nowrap">
                            {stage.fields.map((form, idx) => (
                                <button
                                    key={idx}
                                    className={`py-3 px-6 font-bold text-sm transition-all border-b-2 ${
                                        activeFormIndex === idx
                                        ? 'border-b-blue-600 text-blue-600'
                                        : 'border-b-transparent text-gray-400 hover:text-gray-600'
                                    }`}
                                    onClick={() => setActiveTab({ ...activeTab, dynamic: idx })}
                                >
                                    {form.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-white p-2">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-bold text-gray-800">{currentForm?.name}</h4>
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-black uppercase">
                            {currentForm?.inputs?.length || 0} Actions
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                        {currentForm?.inputs?.map((input, idx) => (
                            <div key={idx} className={input.type === 'textarea' ? 'md:col-span-2' : ''}>
                                {renderDynamicInput(input, activeFormIndex, idx)}
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex justify-center border-t pt-6">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded font-bold transition-all flex items-center gap-2">
                            <Check size={18} /> Update {currentForm?.name}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const FileUpload = ({ id, label, field, accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png", showLabel = true }) => (
        <div className="border rounded p-3 mb-3 bg-gray-50">
            {showLabel && label && <div className="font-bold mb-2">{label}</div>}
            {showLabel && <div className="text-gray-500 text-xs mb-3">Supported formats: PDF, DOC, JPG, PNG (Max size: 5MB)</div>}
            <div className="flex items-center border border-gray-300 rounded bg-white p-2">
                <div className="flex-grow text-gray-500 italic">
                    {getFileDisplayName(field)}
                </div>
                <button
                    type="button"
                    onClick={() => document.getElementById(id).click()}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded text-sm font-semibold"
                >
                    Browse
                </button>
                <input
                    type="file"
                    id={id}
                    accept={accept}
                    className="hidden"
                    onChange={(e) => handleFileChange(field, e)}
                />
            </div>
        </div>
    );

    const DocumentTable = ({ documents }) => (
        <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
                <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left w-2/5">DOCUMENT TYPE</th>
                    <th className="border border-gray-300 px-4 py-2 text-left w-3/5">UPLOAD DOCUMENT</th>
                </tr>
            </thead>
            <tbody>
                {documents.map((doc, index) => (
                    <tr key={index}>
                        <td className="border border-gray-300 px-4 py-3">
                            <div className="font-bold">{doc.title}</div>
                            <div className="text-gray-500 text-xs">Supports PDF, DOC, JPG, PNG, Max 5MB</div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                            <FileUpload id={doc.id} field={doc.field} showLabel={false} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const ActionButtons = ({ showDownload = true, showView = true, orderId }) => (
        <div className="flex gap-2">
            {showDownload && (
                <button 
                  onClick={() => {
                    if (!orderId) {
                      toast.error("Invoice not available for this stage yet.");
                      return;
                    }
                    window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/${orderId}/invoice`, '_blank');
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center"
                >
                    <Download className="h-4 w-4 mr-1" /> Invoice
                </button>
            )}
            {showView && (
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center">
                    <Eye className="h-4 w-4 mr-1" /> View
                </button>
            )}
        </div>
    );

    return (
        <div className="container mx-auto px-4">
            <div className="flex flex-wrap -mx-3">
                {/* Left Column - Customer List */}
                <div className="w-full md:w-1/3 px-3">
                    <div className="bg-white mt-3 p-4 rounded shadow-sm border border-gray-100">
                        <div className="flex items-center mb-4">
                            <button
                                onClick={() => navigate('/admin/project-management/management')}
                                className="mr-3 text-blue-600 hover:text-blue-800"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <h5 className="font-bold text-lg">Residential Customer Application</h5>
                        </div>

                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Search Customer..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <h5 className="font-bold mb-3 flex items-center text-blue-600 uppercase text-xs tracking-wider">
                            <Settings className="h-4 w-4 mr-2" /> Configuration
                        </h5>
                        
                        {matchingConfigs.length > 0 && (
                            <div className="mb-4 space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 px-1 mb-1 leading-none">
                                    Matching Configs ({matchingConfigs.length})
                                </p>
                                {matchingConfigs.map((cfg) => (
                                    <div 
                                        key={cfg._id}
                                        onClick={() => {
                                            setMatchingConfig(cfg);
                                            setConfigSteps(cfg.configValue?.selectedSteps || []);
                                        }}
                                        className={`px-3 py-2 rounded-lg cursor-pointer transition-all border ${
                                            matchingConfig?._id === cfg._id 
                                            ? 'bg-blue-600 border-blue-600 shadow-md' 
                                            : 'bg-white border-gray-200 hover:border-blue-300'
                                        }`}
                                    >
                                        <p className={`text-sm font-bold truncate ${matchingConfig?._id === cfg._id ? 'text-white' : 'text-blue-700'}`}>
                                            {cfg.configValue?.configName || 'Unnamed Config'}
                                        </p>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className={`text-[10px] ${matchingConfig?._id === cfg._id ? 'text-blue-100' : 'text-gray-400'}`}>
                                                {cfg.configValue?.selectedSteps?.length || 0} Steps
                                            </p>
                                            {matchingConfig?._id === cfg._id && (
                                                <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">Active</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                            {filteredCustomers.map((customer) => (
                                <div
                                    key={customer._id}
                                    onClick={() => handleCustomerClick(customer)}
                                    className={`border rounded-lg p-3 mb-3 cursor-pointer transition-all shadow-sm ${selectedCustomer?._id === customer._id
                                        ? 'border-[#0ea5e9] bg-[#e6f1fe]'
                                        : 'bg-white border-gray-200 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="font-semibold mb-2 text-[#0ea5e9] text-[13px]">
                                        {customer.projectName}
                                    </div>
                                    <div className="mb-1 text-[12px] flex items-center text-gray-800">
                                        <Phone className="h-3 w-3 mr-2 text-gray-800 shrink-0" />
                                        {customer.mobile || 'N/A'}
                                    </div>
                                    <div className="mb-1 text-[12px] flex items-center text-gray-800">
                                        <Mail className="h-3 w-3 mr-2 text-gray-800 shrink-0" />
                                        <span className="truncate">{customer.email || 'N/A'}</span>
                                    </div>
                                    <div className="mb-1 text-[12px] flex items-start text-gray-800">
                                        <Navigation className="h-3 w-3 mr-2 mt-0.5 text-gray-800 shrink-0" />
                                        <span className="leading-tight">{customer.address || customer.district?.name || 'N/A'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Application Journey */}
                <div className="w-full md:w-2/3 px-3">
                    <div className="bg-white shadow-sm mt-3 border border-gray-100 rounded-lg">
                        <div className="p-6">
                            <h4 className="text-xl font-semibold mb-2">Application Journey Steps</h4>
                            <p className="mb-4">
                                Customer Name: <span className="text-blue-600 font-bold">{selectedCustomer?.projectName || 'Select a Customer'}</span>
                            </p>
                            <hr className="mb-6" />
                            {/* Step Indicator */}
                             {(!matchingConfig && configSteps.length === 0) ? (
                                <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300 mb-8">
                                    <p className="text-gray-500 font-bold mb-2">No configuration available</p>
                                    <p className="text-sm text-gray-400">Admin hasn't configured steps for this location.</p>
                                </div>
                             ) : (
                                <div className="step-indicator relative flex justify-between mb-8">
                                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0"></div>
                                    {(configSteps.length > 0 ? configSteps : (journeyStages.length > 0 ? journeyStages : [1, 2, 3, 4, 5])).map((stage, index) => {
                                        const step = index + 1;
                                        const stepName = configSteps.length > 0 ? stage : (stage.name || (
                                            step === 1 ? 'Project SignUp' :
                                                step === 2 ? 'Feasibility Approval' :
                                                    step === 3 ? 'Installation Status' :
                                                        step === 4 ? 'Meter Installation' :
                                                            'Subsidy'
                                        ));
                                        return (
                                            <div
                                                key={index}
                                                onClick={() => handleStepClick(step)}
                                                className="step-indicator-item relative z-10 text-center flex-1 cursor-pointer"
                                            >
                                                <div
                                                    className={`step-circle w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 font-bold transition-all ${step < currentStep
                                                        ? 'bg-green-500 text-white shadow-lg'
                                                        : step === currentStep
                                                            ? 'bg-blue-600 text-white shadow-lg scale-110'
                                                            : 'bg-white border-2 border-gray-200 text-gray-400'
                                                        }`}
                                                >
                                                    {step < currentStep ? <Check size={18} /> : step}
                                                </div>
                                                <div
                                                    className={`step-label text-[11px] font-bold ${step === currentStep ? 'text-blue-600' : 'text-gray-500'}`}
                                                >
                                                    {stepName}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                             )}

                            {/* Wizard Steps */}
                            <div className="wizard-content">
                                {(() => {
                                    const stepIndex = currentStep;
                                    const stage = journeyStages[stepIndex - 1];
                                    const stepName = configSteps[stepIndex - 1] || (typeof stage === 'object' ? stage?.name : stage);
                                    const isFirstStep = stepIndex === 1;
                                    
                                    if (configSteps.length === 0) {
                                        return (
                                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                                <FileWarningIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                <h3 className="text-lg font-medium text-gray-500">No Content Found</h3>
                                                <p className="text-gray-400">Please select a project with a valid configuration.</p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="space-y-6">
                                            {/* Specialized content for Step 1 (Timeline) */}
                                            {isFirstStep && (
                                                <div className="wizard-step bg-white border border-gray-100 rounded-xl p-6 shadow-sm mb-6">
                                                    <h5 className="text-blue-600 font-bold uppercase tracking-widest text-[11px] mb-6 flex items-center gap-2">
                                                        <Activity size={14} /> Application Journey History
                                                    </h5>
                                                    <div className="timeline relative pl-2">
                                                        <div className="absolute top-2 bottom-0 left-[19px] w-[1px] bg-gray-300"></div>
                                                        <ul className="space-y-0">
                                                            {getTimelineItems(selectedCustomer).map((item, index, arr) => (
                                                                <li key={index} className="timeline-item relative pl-12 pb-5">
                                                                    <div
                                                                        className={`timeline-icon absolute left-[10px] top-0 w-[18px] h-[18px] rounded-full flex items-center justify-center text-white text-[10px] shadow-sm z-10 ${item.color === 'green' ? 'bg-green-500' : 'bg-[#0ea5e9]'
                                                                            }`}
                                                                    >
                                                                        {getIcon(item.icon, 'h-2.5 w-2.5')}
                                                                    </div>
                                                                    <div className="timeline-content pt-[-2px]">
                                                                        <div className="timeline-title text-[13px] text-gray-800 flex items-center font-medium">
                                                                            {item.title}
                                                                            {item.hasPdf && <FileText className="h-3 w-3 text-red-500 ml-1.5" />}
                                                                        </div>
                                                                        <div className="text-[11px] text-gray-700 mt-0.5">
                                                                            {item.date} {item.user ? ` | ${item.user}` : ''}
                                                                            {item.status && (
                                                                                <span className={`font-bold ml-1 ${item.status === 'Completed' ? 'text-green-600' : 'text-[#0ea5e9]'}`}>
                                                                                    {item.status}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {item.details && (
                                                                            <div
                                                                                className="text-[11px] text-gray-700 mt-0.5"
                                                                                dangerouslySetInnerHTML={{ __html: item.details }}
                                                                            />
                                                                        )}
                                                                        {item.mapLocation && (
                                                                            <div className="mt-0.5">
                                                                                <a href="#" className="text-[#0ea5e9] text-[11px] font-medium hover:underline">Map Location</a>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    {index !== arr.length - 1 && (
                                                                        <div className="absolute left-[16.5px] bottom-[10px] z-10 bg-white text-gray-700 text-[14px] leading-none h-[14px] w-[6px] flex items-center justify-center font-bold">
                                                                            ⋮
                                                                        </div>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Render Dynamic Content for ALL Steps */}
                                            {renderDynamicStepContent(stepName)}
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Navigation Buttons */}
                            < div className="flex justify-between mt-6" >
                                <button
                                    onClick={handlePrev}
                                    disabled={currentStep === 1}
                                    className={`px-4 py-2 rounded flex items-center text-[14px] font-medium ${currentStep === 1
                                        ? 'bg-gray-400 text-white cursor-not-allowed'
                                        : 'bg-gray-500 hover:bg-gray-600 text-white'
                                        }`}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                                </button>
                                <button
                                    onClick={handleNext}
                                    className={`px-5 py-2 rounded flex items-center text-[14px] font-medium ${currentStep === totalSteps
                                        ? 'bg-[#0ea5e9] hover:bg-blue-600 text-white'
                                        : 'bg-[#0ea5e9] hover:bg-blue-600 text-white'
                                        }`}
                                >
                                    {currentStep === totalSteps ? (
                                        <>Complete<Check className="h-4 w-4 ml-1" /></>
                                    ) : (
                                        <>Next <ChevronRight className="h-4 w-4 ml-1" /></>
                                    )}
                                </button>
                            </div>

                            {/* Footer */}
                            <div className="mt-8 text-center text-sm text-gray-500 pb-4">
                                Copyright © 2025 Solarkits. All Rights Reserved.
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
};

export default AdminResidentialProject;
