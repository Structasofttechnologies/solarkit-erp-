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
    FolderX
} from 'lucide-react';

import { getAllProjects, updateProject } from '../../../dealer/services/projectApi';

const FranchiseResidentialProjectManagement = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showProjectForm, setShowProjectForm] = useState(false);
    const [activeTab, setActiveTab] = useState('consumer');
    const [files, setFiles] = useState({});
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        consumerName: '',
        consumerNumber: '',
        authorizedPersonName: '',
        mobileNumber: '',
        emailId: '',
        vendorAgreement: false,
        address: ''
    });

    const totalSteps = 5;

    // Timeline generation based on hardcoded layout request
    const getTimelineItems = (customer) => {
        return [
            {
                title: 'Service Ticket Closed',
                date: '23 Jan 2024',
                user: 'Completed by RajDeep Singh',
                icon: 'CheckSquare',
                color: 'blue'
            },
            {
                title: 'Service Ticket Created',
                date: '24 Jan 2024',
                user: 'Assigned to RajDeep Singh',
                icon: 'User',
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
                title: 'Subsidy Received',
                date: '25 Jan 2024',
                hasPdf: true,
                icon: 'IndianRupee',
                color: 'blue'
            },
            {
                title: 'Subsidy Claimed',
                date: '25 Jan 2024',
                hasPdf: true,
                icon: 'IndianRupee',
                color: 'blue'
            },
            {
                title: 'PCR by Discom',
                date: '25 Jan 2024',
                status: 'Completed',
                hasPdf: true,
                icon: 'FileText',
                color: 'blue'
            },
            {
                title: 'Solar Meter Status',
                date: '25 Jan 2024',
                status: 'Completed',
                icon: 'Zap',
                color: 'blue'
            },
            {
                title: 'Meter Change File',
                date: '25 Jan 2024',
                hasPdf: true,
                icon: 'FileText',
                color: 'blue'
            },
            {
                title: 'Assigned Installation To Prince',
                date: 'Installer Prince',
                user: '25 Jan 2024',
                details: '2053, New Ram Bagh, Junagarh 143001',
                mapLocation: true,
                icon: 'User',
                color: 'blue'
            },
            {
                title: 'Picked Combo Kit From Warehouse',
                date: 'Rajkot Warehouse',
                user: '23 Jan 2024',
                icon: 'MapPin',
                color: 'blue'
            },
            {
                title: 'Combokit Reached Company Warehouse',
                date: 'Rajkot Warehouse',
                user: '23 Jan 2024',
                mapLocation: true,
                icon: 'MapPin',
                color: 'blue'
            },
            {
                title: 'Meter Change Payment Paid',
                date: '₹2,650 by online',
                status: 'Completed',
                details: '09 Oct 2023',
                icon: 'CreditCard',
                color: 'blue'
            },
            {
                title: 'Combokit Payment Paid',
                date: '₹1,30,0000 by online',
                status: 'Completed',
                details: '09 Oct 2023',
                hasPdf: true,
                icon: 'CreditCard',
                color: 'blue'
            },
            {
                title: 'Feasibility approbal by Discom(Auto)',
                date: '23 Oct 2023',
                icon: 'CheckSquare',
                color: 'blue'
            },
            {
                title: 'Reg. Summited for Subsidy',
                date: 'by Ravi',
                user: '07 Jan 2024',
                hasPdf: true,
                icon: 'FileText',
                color: 'blue'
            },
            {
                title: 'Token Amount Received',
                date: 'paid 20,000 online',
                details: '05 Jan 2024',
                icon: 'IndianRupee',
                color: 'blue'
            }
        ];
    };

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await getAllProjects({ category: 'Residential' });
                if (response.success) {
                    setProjects(response.data);
                    if (response.data.length > 0) {
                        setSelectedCustomer(response.data[0]);
                    }
                }
            } catch (error) {
                console.error('Error fetching residential projects:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

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
        if (!selectedCustomer) return;

        // Optimistic update
        setCurrentStep(newStep);

        try {
            await updateProject(selectedCustomer._id, { currentStep: newStep });
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
                const response = await updateProject(selectedCustomer._id, { status: 'Completed' });
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
                // Map form data to schema fields
                // consumerName is projectName or we map it to consumerName if schema had it, but schema has projectName. 
                // However, based on earlier code `projectName` is used as customer name.
                // Let's assume we update projectName with consumerName or keep it.
                // The form has "Consumer Name", "Consumer Number", "Authorized Person", "Mobile", "Email".

                projectName: formData.consumerName,
                consumerNumber: formData.consumerNumber,
                authorizedPersonName: formData.authorizedPersonName,
                mobile: formData.mobileNumber,
                email: formData.emailId,
                address: formData.address,
                // statusStage: 'application' // Should we move to next stage? Maybe not yet, just save details.
            };

            const response = await updateProject(selectedCustomer._id, payload);
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

    const FileUpload = ({ id, label, field, accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png" }) => (
        <div className="border rounded p-3 mb-3 bg-gray-50">
            {label && <div className="font-bold mb-2">{label}</div>}
            <div className="text-gray-500 text-xs mb-3">Supported formats: PDF, DOC, JPG, PNG (Max size: 5MB)</div>
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
                            <FileUpload id={doc.id} field={doc.field} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const ActionButtons = ({ showDownload = true, showView = true }) => (
        <div className="flex gap-2">
            {showDownload && (
                <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center">
                    <Download className="h-4 w-4 mr-1" /> Download
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
                                onClick={() => navigate('/franchisee/project-management/management')}
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

                        <h5 className="font-bold mb-3 flex items-center">
                            <User className="h-4 w-4 mr-2" /> Select Customer
                        </h5>

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
                            <div className="step-indicator relative flex justify-between mb-8">
                                <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200 z-0"></div>
                                {[1, 2, 3, 4, 5].map((step) => (
                                    <div
                                        key={step}
                                        onClick={() => handleStepClick(step)}
                                        className={`step-indicator-item relative z-10 text-center flex-1 cursor-pointer ${getStepStatus(step)
                                            }`}
                                    >
                                        <div
                                            className={`step-circle w-8 h-8 text-sm rounded-full flex items-center justify-center mx-auto mb-1 font-bold shadow-sm transition-colors ${step < currentStep
                                                ? 'bg-green-500 text-white'
                                                : step === currentStep
                                                    ? 'bg-[#0ea5e9] text-white ring-4 ring-blue-50'
                                                    : 'bg-gray-100 border border-gray-200 text-gray-400'
                                                }`}
                                        >
                                            {step < currentStep ? <Check className="h-4 w-4" /> : step}
                                        </div>
                                        <div
                                            className={`step-label text-[11px] font-medium mt-2 ${step === currentStep
                                                ? 'text-[#0ea5e9] font-bold'
                                                : step < currentStep
                                                    ? 'text-green-600'
                                                    : 'text-gray-400'
                                                }`}
                                        >
                                            {step === 1 && 'Project SignUp'}
                                            {step === 2 && 'Feasibility Approval'}
                                            {step === 3 && 'Installation Status'}
                                            {step === 4 && 'Meter Installation'}
                                            {step === 5 && 'Subsidy'}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Wizard Steps */}
                            <div className="wizard-content">
                                {/* Step 1: Project SignUp */}
                                {currentStep === 1 && (
                                    <div className="wizard-step">
                                        <h5 className="text-[#0ea5e9] font-bold text-lg mb-4">Project SignUp</h5>

                                        {!showProjectForm ? (
                                            <>
                                                <button
                                                    onClick={() => setShowProjectForm(true)}
                                                    className="bg-[#0ea5e9] hover:bg-blue-600 text-white px-4 py-2 rounded text-[13px] mb-8 flex items-center shadow-sm"
                                                >
                                                    <UserPlus className="h-4 w-4 mr-2" /> Project SignUp
                                                </button>

                                                {/* Journey History */}
                                                <div className="mt-4">
                                                    <div className="flex items-center mb-6">
                                                        <RefreshCw className="h-4 w-4 text-gray-800 mr-2 font-bold" />
                                                        <h6 className="font-bold text-[13px] text-gray-900">Application Journey History</h6>
                                                    </div>

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
                                            </>
                                        ) : (
                                            <div className="mt-4 border-t pt-4">
                                                <button
                                                    onClick={() => setShowProjectForm(false)}
                                                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded mb-4 flex items-center"
                                                >
                                                    <ChevronLeft className="h-4 w-4 mr-2" /> Back to Journey
                                                </button>

                                                {/* Step 1 Tabs */}
                                                <div className="border-b border-gray-200 mb-4">
                                                    <div className="flex">
                                                        <button
                                                            className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'consumer'
                                                                ? 'border-b-2 border-blue-600 text-blue-600'
                                                                : 'text-gray-500 hover:text-gray-700'
                                                                }`}
                                                            onClick={() => setActiveTab('consumer')}
                                                        >
                                                            Consumer Registered
                                                        </button>
                                                        <button
                                                            className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'application'
                                                                ? 'border-b-2 border-blue-600 text-blue-600'
                                                                : 'text-gray-500 hover:text-gray-700'
                                                                }`}
                                                            onClick={() => setActiveTab('application')}
                                                        >
                                                            Application Submission
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Consumer Registration Form */}
                                                {activeTab === 'consumer' && (
                                                    <div>
                                                        <h4 className="text-blue-600 font-semibold mb-4">Consumer Registration Form</h4>
                                                        <div className="space-y-4">
                                                            <div>
                                                                <label className="block font-bold mb-1">Consumer Name (As per Electricity Bill)</label>
                                                                <input
                                                                    type="text"
                                                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                    placeholder="Consumer Name"
                                                                    value={formData.consumerName}
                                                                    onChange={(e) => setFormData({ ...formData, consumerName: e.target.value })}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block font-bold mb-1">Consumer Number (As per Electricity Bill)</label>
                                                                <input
                                                                    type="text"
                                                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                    placeholder="Consumer Number"
                                                                    value={formData.consumerNumber}
                                                                    onChange={(e) => setFormData({ ...formData, consumerNumber: e.target.value })}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block font-bold mb-1">Consumer Authorized Person Name</label>
                                                                <input
                                                                    type="text"
                                                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                    placeholder="Authorized Person Name"
                                                                    value={formData.authorizedPersonName}
                                                                    onChange={(e) => setFormData({ ...formData, authorizedPersonName: e.target.value })}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block font-bold mb-1">Consumer Mobile Number</label>
                                                                <input
                                                                    type="text"
                                                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                    placeholder="Mobile Number"
                                                                    value={formData.mobileNumber}
                                                                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block font-bold mb-1">Consumer Email Id</label>
                                                                <input
                                                                    type="email"
                                                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                    placeholder="Email Id"
                                                                    value={formData.emailId}
                                                                    onChange={(e) => setFormData({ ...formData, emailId: e.target.value })}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block font-bold mb-1">Consumer Address</label>
                                                                <input
                                                                    type="text"
                                                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                    placeholder="Address"
                                                                    value={formData.address}
                                                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                                    checked={formData.vendorAgreement}
                                                                    onChange={(e) => setFormData({ ...formData, vendorAgreement: e.target.checked })}
                                                                />
                                                                <label className="ml-2 text-sm">
                                                                    I agree to the <a href="#" className="text-blue-600 hover:underline">Vendor Agreement</a> terms and conditions
                                                                </label>
                                                            </div>
                                                            <div>
                                                                <button
                                                                    onClick={handleRegister}
                                                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 font-bold rounded"
                                                                >
                                                                    Register
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Application Submission Form */}
                                                {activeTab === 'application' && (
                                                    <div>
                                                        <h4 className="text-blue-600 font-semibold mb-4">Application Submission Form</h4>
                                                        <FileUpload
                                                            id="appAckInput"
                                                            label="Application Acknowledgement"
                                                            field="appAck"
                                                        />
                                                        <FileUpload
                                                            id="eTokenInput"
                                                            label="E-Token"
                                                            field="eToken"
                                                        />
                                                        <div className="text-center mt-4">
                                                            <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 font-bold rounded">
                                                                SUBMIT APPLICATION
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div >
                                )}

                                {/* Step 2: Feasibility Approval */}
                                {
                                    currentStep === 2 && (
                                        <div className="wizard-step">
                                            <h5 className="text-[#0ea5e9] font-bold text-[20px] mb-4">Feasibility Approval</h5>

                                            <div className="border border-[#7dd3fc] rounded-[4px] bg-white shadow-sm overflow-hidden">
                                                <div className="bg-[#f0f9ff] flex border-b border-[#7dd3fc] flex-wrap">
                                                    <button
                                                        className={`py-3.5 px-6 font-medium text-[14px] focus:outline-none transition-colors ${activeTab === 'feasibility'
                                                            ? 'bg-white text-gray-800 border-r border-[#7dd3fc] border-b-0 -mb-[1px] relative z-10'
                                                            : 'text-gray-500 hover:text-gray-800 border-x border-transparent'
                                                            }`}
                                                        onClick={() => setActiveTab('feasibility')}
                                                    >
                                                        Feasibility
                                                    </button>
                                                    <button
                                                        className={`py-3.5 px-6 font-medium text-[14px] focus:outline-none transition-colors ${activeTab === 'meterCharge'
                                                            ? 'bg-white text-gray-800 border-x border-[#7dd3fc] border-b-0 -mb-[1px] relative z-10'
                                                            : 'text-gray-500 hover:text-gray-800 border-x border-transparent'
                                                            }`}
                                                        onClick={() => setActiveTab('meterCharge')}
                                                    >
                                                        Meter Charge Generation Paid (optional)
                                                    </button>
                                                </div>

                                                <div className="p-6 pb-10">
                                                    {/* Feasibility Form */}
                                                    {activeTab === 'feasibility' && (
                                                        <div>
                                                            <div className="font-bold text-[#1e293b] text-[16px] mb-1">Feasibility Form</div>
                                                            <div className="text-gray-500 text-[13px] mb-4">Feasibility Letter (Supports PDF, DOC, JPG, PNG, Max 5MB)</div>

                                                            <div className="border border-gray-300 rounded flex justify-between items-center p-1.5 bg-white mb-6">
                                                                <span className="text-gray-400 italic text-[14px] pl-3">No file selected</span>
                                                                <button className="bg-[#f59e0b] hover:bg-yellow-600 text-white px-5 py-1.5 rounded text-[14px] font-medium transition-colors cursor-pointer">Browse</button>
                                                            </div>

                                                            <div className="text-center mt-8">
                                                                <button className="bg-[#f59e0b] hover:bg-yellow-600 text-white px-8 py-2.5 font-bold rounded shadow-sm text-[13px] cursor-pointer">
                                                                    SUBMIT
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Meter Charge Form */}
                                                    {activeTab === 'meterCharge' && (
                                                        <div>
                                                            <div className="font-bold text-[#1e293b] text-[16px] mb-1">Meter Charge Generation Form</div>
                                                            <div className="text-gray-500 text-[13px] mb-4">Meter Charge Payment Receipt (Supports PDF, DOC, JPG, PNG, Max 5MB)</div>

                                                            <div className="border border-gray-300 rounded flex justify-between items-center p-1.5 bg-white mb-6">
                                                                <span className="text-gray-400 italic text-[14px] pl-3">No file selected</span>
                                                                <button className="bg-[#f59e0b] hover:bg-yellow-600 text-white px-5 py-1.5 rounded text-[14px] font-medium transition-colors cursor-pointer">Browse</button>
                                                            </div>

                                                            <div className="text-center mt-8">
                                                                <button className="bg-[#f59e0b] hover:bg-yellow-600 text-white px-8 py-2.5 font-bold rounded shadow-sm text-[13px] cursor-pointer">
                                                                    SUBMIT
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }

                                {/* Step 3: Installation Status */}
                                {
                                    currentStep === 3 && (
                                        <div className="wizard-step">
                                            <h5 className="text-[#0ea5e9] font-bold text-[20px] mb-4">Installation Status</h5>

                                            <div className="border border-[#7dd3fc] rounded-[4px] bg-white shadow-sm overflow-hidden">
                                                <div className="bg-[#f0f9ff] flex border-b border-[#7dd3fc] flex-wrap">
                                                    {['Vendor Selection', 'Work Start (vendor Agreement)', 'Solar Installation Details', 'PCR (vendor)'].map((tab, index) => (
                                                        <button
                                                            key={index}
                                                            className={`py-3.5 px-6 font-medium text-[14px] focus:outline-none transition-colors ${activeTab === `install${index}`
                                                                ? 'bg-white text-gray-800 border-b-0 -mb-[1px] relative z-10'
                                                                : 'text-gray-500 hover:text-gray-800 border-b border-transparent'
                                                                } ${activeTab === `install${index}` ? `${index === 0 ? 'border-r border-[#7dd3fc]' : 'border-x border-[#7dd3fc]'}` : 'border-x border-transparent'}`}
                                                            onClick={() => setActiveTab(`install${index}`)}
                                                        >
                                                            {tab}
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className="p-6 pb-10">
                                                    {/* Vendor Selection */}
                                                    {activeTab === 'install0' && (
                                                        <div>
                                                            <div className="font-bold text-gray-800 text-[16px] mb-1">Vendor Selection</div>
                                                            <div className="text-gray-500 text-[12px] mb-4">Screenshot of Vendor Selected (Supports PDF, DOC, JPG, PNG, Max 5MB)</div>

                                                            <div className="border border-gray-300 rounded flex justify-between items-center p-1.5 bg-white mb-6">
                                                                <span className="text-gray-400 italic text-[14px] pl-3">No file selected</span>
                                                                <button className="bg-[#f59e0b] hover:bg-yellow-600 text-white px-5 py-1.5 rounded text-[14px] font-medium transition-colors cursor-pointer">Browse</button>
                                                            </div>

                                                            <div className="text-center mt-8">
                                                                <button className="bg-[#f59e0b] hover:bg-yellow-600 text-white px-8 py-2.5 font-bold rounded shadow-sm text-[13px] cursor-pointer">
                                                                    SUBMIT
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Work Start Form */}
                                                    {activeTab === 'install1' && (
                                                        <div>
                                                            <h6 className="font-bold text-[16px] text-[#1e293b] mb-4">Certificate of Support (Vendor Agreement) Form</h6>

                                                            <div className="border border-[#7dd3fc] rounded overflow-hidden">
                                                                <div className="flex bg-[#6bb0f5] text-white font-semibold text-[13px] uppercase">
                                                                    <div className="w-1/2 p-3.5 border-r border-white/30">DOCUMENT TYPE</div>
                                                                    <div className="w-1/2 p-3.5">UPLOAD DOCUMENT</div>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    {[
                                                                        { title: 'Vendor Agreement', desc: 'Supports PDF, DOC, JPG, PNG, Max 5MB' },
                                                                        { title: 'Email ID', desc: 'Supports PDF, DOC, JPG, PNG, Max 5MB' },
                                                                        { title: 'Meter Charge Receipt', desc: 'Supports PDF, DOC, JPG, PNG, Max 5MB' },
                                                                        { title: 'Bank Details(Cancelled Cheque/Bank Passbook with Clear Photo)', desc: 'Supports PDF, DOC, JPG, PNG, Max 5MB' },
                                                                        { title: "Panel Number Photo's", desc: 'Supports PDF, DOC, JPG, PNG, Max 5MB' },
                                                                        { title: 'Inverter Serial Number Photo', desc: 'Supports PDF, DOC, JPG, PNG, Max 5MB' },
                                                                        { title: 'Customer Site Photo(Geo Tagged)', desc: 'Supports PDF, DOC, JPG, PNG, Max 5MB' },
                                                                        { title: 'Application Acknowledgement (Registration Letter)', desc: 'Supports PDF, DOC, JPG, PNG, Max 5MB' }
                                                                    ].map((doc, idx, arr) => (
                                                                        <div key={idx} className={`flex items-center bg-white ${idx !== arr.length - 1 ? 'border-b border-gray-200' : ''}`}>
                                                                            <div className="w-1/2 p-4 border-r border-gray-200">
                                                                                <div className="text-[14px] text-gray-800 font-medium mb-0.5">{doc.title}</div>
                                                                                <div className="text-[11px] text-gray-400">{doc.desc}</div>
                                                                            </div>
                                                                            <div className="w-1/2 p-4">
                                                                                <div className="border border-gray-300 rounded flex justify-between items-center p-1.5 bg-white">
                                                                                    <span className="text-gray-400 italic text-[14px] pl-3">No file selected</span>
                                                                                    <button className="bg-[#f59e0b] hover:bg-yellow-600 text-white px-5 py-1.5 rounded text-[13px] font-medium transition-colors cursor-pointer">Browse</button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="text-center mt-8">
                                                                <button className="bg-[#f59e0b] hover:bg-yellow-600 text-white px-8 py-2.5 font-bold rounded shadow-sm text-[13px] cursor-pointer">
                                                                    SUBMIT
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Solar Installation Details */}
                                                    {activeTab === 'install2' && (
                                                        <div>
                                                            <h6 className="font-bold text-[16px] text-[#1e293b] mb-4">Solar Installation Details Form</h6>

                                                            <div className="border border-[#7dd3fc] rounded overflow-hidden">
                                                                <div className="flex bg-[#6bb0f5] text-white font-semibold text-[13px] uppercase">
                                                                    <div className="w-1/2 p-3.5 border-r border-white/30">DOCUMENT TYPE</div>
                                                                    <div className="w-1/2 p-3.5">UPLOAD DOCUMENT</div>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    {[
                                                                        { title: 'Customer Bank Details Uploaded on National Portal Screenshot', desc: 'Supports PDF, DOC, JPG, PNG, Max 5MB' },
                                                                        { title: 'Installation Stage Completed by CP Screenshot', desc: 'Supports PDF, DOC, JPG, PNG, Max 5MB' }
                                                                    ].map((doc, idx, arr) => (
                                                                        <div key={idx} className={`flex items-center bg-white ${idx !== arr.length - 1 ? 'border-b border-gray-200' : ''}`}>
                                                                            <div className="w-1/2 p-4 border-r border-gray-200">
                                                                                <div className="text-[14px] text-gray-800 font-medium mb-0.5">{doc.title}</div>
                                                                                <div className="text-[11px] text-gray-400">{doc.desc}</div>
                                                                            </div>
                                                                            <div className="w-1/2 p-4">
                                                                                <div className="border border-gray-300 rounded flex justify-between items-center p-1.5 bg-white">
                                                                                    <span className="text-gray-400 italic text-[14px] pl-3">No file selected</span>
                                                                                    <button className="bg-[#f59e0b] hover:bg-yellow-600 text-white px-5 py-1.5 rounded text-[13px] font-medium transition-colors cursor-pointer">Browse</button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="text-center mt-8">
                                                                <button className="bg-[#f59e0b] hover:bg-yellow-600 text-white px-8 py-2.5 font-bold rounded shadow-sm text-[13px] cursor-pointer">
                                                                    SUBMIT
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* PCR Vendor */}
                                                    {activeTab === 'install3' && (
                                                        <div>
                                                            <div className="font-medium text-gray-800 text-[16px] mb-1">PCR (vendor)</div>
                                                            <div className="text-gray-500 text-[13px] mb-4">PCR Report from Vendor (Supports PDF, DOC, JPG, PNG, Max 5MB)</div>

                                                            <div className="border border-gray-200 rounded overflow-hidden shadow-sm mt-8 mb-6">
                                                                <div className="flex bg-[#6bb0f5] text-white font-semibold text-[13px] uppercase">
                                                                    <div className="w-3/4 p-4">DOCUMENT TYPE</div>
                                                                    <div className="w-1/4 p-4">ACTIONS</div>
                                                                </div>
                                                                <div className="flex items-center bg-white p-5 border-t border-gray-200">
                                                                    <div className="w-3/4">
                                                                        <div className="text-[15px] text-[#1e293b] font-bold mb-1">Installation Proof</div>
                                                                        <div className="text-[13px] text-gray-500">(In app Project Completion Report will Generate)</div>
                                                                    </div>
                                                                    <div className="w-1/4 flex space-x-2">
                                                                        <button className="bg-[#22c55e] hover:bg-green-600 text-white px-3.5 py-1.5 rounded text-[13px] font-bold flex items-center transition-colors cursor-pointer">
                                                                            <Download className="w-4 h-4 mr-1.5" /> Download
                                                                        </button>
                                                                        <button className="bg-[#0ea5e9] hover:bg-blue-600 text-white px-3.5 py-1.5 rounded text-[13px] font-bold flex items-center transition-colors cursor-pointer">
                                                                            <Eye className="w-4 h-4 mr-1.5" /> View
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="text-center">
                                                                <button className="bg-[#f59e0b] hover:bg-yellow-600 text-white px-8 py-2.5 font-bold rounded shadow-sm text-[13px] cursor-pointer">
                                                                    CONFIRM COMPLETION
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }

                                {/* Step 4: Meter Installation */}
                                {
                                    currentStep === 4 && (
                                        <div className="wizard-step">
                                            <h5 className="text-[#0ea5e9] font-bold text-[20px] mb-4">Meter Installation</h5>

                                            <div className="border border-[#7dd3fc] rounded-[4px] bg-white shadow-sm overflow-hidden">
                                                <div className="bg-[#f0f9ff] flex border-b border-[#7dd3fc]">
                                                    <button
                                                        className={`py-3.5 px-6 font-medium text-[14px] focus:outline-none transition-colors ${activeTab === 'meterChange'
                                                            ? 'bg-white text-gray-800 border-r border-[#7dd3fc] border-b-0 -mb-[1px] relative z-10'
                                                            : 'text-gray-500 hover:text-gray-800 border-x border-transparent'
                                                            }`}
                                                        onClick={() => setActiveTab('meterChange')}
                                                    >
                                                        Meter Change fill Submit And Meter Install
                                                    </button>
                                                    <button
                                                        className={`py-3.5 px-6 font-medium text-[14px] focus:outline-none transition-colors ${activeTab === 'inspection'
                                                            ? 'bg-white text-gray-800 border-x border-[#7dd3fc] border-b-0 -mb-[1px] relative z-10'
                                                            : 'text-gray-500 hover:text-gray-800 border-x border-transparent'
                                                            }`}
                                                        onClick={() => setActiveTab('inspection')}
                                                    >
                                                        Inspection (Project Commissioning)
                                                    </button>
                                                </div>

                                                <div className="p-6 pb-10">
                                                    {/* Meter Change Form */}
                                                    {activeTab === 'meterChange' && (
                                                        <div>
                                                            <div className="border border-[#7dd3fc] rounded overflow-hidden shadow-sm">
                                                                <table className="min-w-full text-[13px]">
                                                                    <thead className="bg-[#6bb0f5] text-white">
                                                                        <tr>
                                                                            <th className="px-5 py-3.5 text-left w-3/4 font-semibold uppercase border-r border-white/30">DOCUMENT TYPE</th>
                                                                            <th className="px-5 py-3.5 text-left w-1/4 font-semibold uppercase">ACTIONS</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="bg-white">
                                                                        {[
                                                                            'Application Acknowledgement',
                                                                            'Meter Charge Receipt',
                                                                            'Net Meter Agreement',
                                                                            'Custom Signed Adhar Card',
                                                                            '2 Witness ID Proof',
                                                                            'Tax Invoice',
                                                                            'Cancel Letter',
                                                                            'DCR Letter',
                                                                            'Customer Site Photo'
                                                                        ].map((doc, index, arr) => (
                                                                            <tr key={index} className={`hover:bg-gray-50 ${index !== arr.length - 1 ? 'border-b border-gray-200' : ''}`}>
                                                                                <td className="px-5 py-4 text-[#1e293b] font-medium border-r border-gray-200">{doc}</td>
                                                                                <td className="px-5 py-4">
                                                                                    <div className="flex space-x-2">
                                                                                        <button className="bg-[#22c55e] hover:bg-green-600 text-white px-3.5 py-1.5 rounded text-[12px] font-bold flex items-center transition-colors cursor-pointer">
                                                                                            <Download className="w-3.5 h-3.5 mr-1" /> Download
                                                                                        </button>
                                                                                        <button className="bg-[#0ea5e9] hover:bg-blue-600 text-white px-3.5 py-1.5 rounded text-[12px] font-bold flex items-center transition-colors cursor-pointer">
                                                                                            <Eye className="w-3.5 h-3.5 mr-1" /> View
                                                                                        </button>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Inspection Form */}
                                                    {activeTab === 'inspection' && (
                                                        <div>
                                                            <div className="font-medium text-[#1e293b] text-[16px] mb-1">Inspection (Project Commissioning)</div>
                                                            <div className="text-gray-500 text-[13px] mb-4">Inspection Report (Supports PDF, DOC, JPG, PNG, Max 5MB)</div>

                                                            <div className="border border-gray-300 rounded flex justify-between items-center p-1.5 bg-white mb-6">
                                                                <span className="text-gray-400 italic text-[14px] pl-3">No file selected</span>
                                                                <button className="bg-[#f59e0b] hover:bg-yellow-600 text-white px-5 py-1.5 rounded text-[14px] font-medium transition-colors cursor-pointer">Browse</button>
                                                            </div>

                                                            <div className="text-center mt-8">
                                                                <button className="bg-[#f59e0b] hover:bg-yellow-600 text-white px-8 py-2.5 font-bold rounded shadow-sm text-[13px] cursor-pointer">
                                                                    SUBMIT
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }

                                {/* Step 5: Subsidy */}
                                {
                                    currentStep === 5 && (
                                        <div className="wizard-step">
                                            <h5 className="text-[#0ea5e9] font-bold text-[20px] mb-4">Subsidy</h5>

                                            <div className="border border-[#7dd3fc] rounded-[4px] bg-white shadow-sm overflow-hidden">
                                                <div className="bg-[#f0f9ff] flex border-b border-[#7dd3fc]">
                                                    <button
                                                        className={`py-3.5 px-6 font-medium text-[14px] focus:outline-none transition-colors ${activeTab === 'subsidyRequest'
                                                            ? 'bg-white text-gray-800 border-r border-[#7dd3fc] border-b-0 -mb-[1px] relative z-10'
                                                            : 'text-gray-500 hover:text-gray-800 border-x border-transparent'
                                                            }`}
                                                        onClick={() => setActiveTab('subsidyRequest')}
                                                    >
                                                        Subsidy Request
                                                    </button>
                                                    <button
                                                        className={`py-3.5 px-6 font-medium text-[14px] focus:outline-none transition-colors ${activeTab === 'subsidyDisbursal'
                                                            ? 'bg-white text-gray-800 border-x border-[#7dd3fc] border-b-0 -mb-[1px] relative z-10'
                                                            : 'text-gray-500 hover:text-gray-800 border-x border-transparent'
                                                            }`}
                                                        onClick={() => setActiveTab('subsidyDisbursal')}
                                                    >
                                                        Subsidy Disbursal
                                                    </button>
                                                </div>

                                                <div className="p-6 pb-10">
                                                    {/* Subsidy Request Form */}
                                                    {activeTab === 'subsidyRequest' && (
                                                        <div>
                                                            <div className="font-bold text-[#1e293b] text-[16px] mb-1">Subsidy Request</div>
                                                            <div className="text-gray-500 text-[13px] mb-4">Subsidy Requested Screenshot (Supports PDF, DOC, JPG, PNG, Max 5MB)</div>

                                                            <div className="border border-gray-300 rounded flex justify-between items-center p-1.5 bg-white mb-6">
                                                                <span className="text-gray-400 italic text-[14px] pl-3">No file selected</span>
                                                                <button className="bg-[#f59e0b] hover:bg-yellow-600 text-white px-5 py-1.5 rounded text-[14px] font-medium transition-colors cursor-pointer">Browse</button>
                                                            </div>

                                                            <div className="text-center mt-8">
                                                                <button className="bg-[#f59e0b] hover:bg-yellow-600 text-white px-8 py-2.5 font-bold rounded shadow-sm text-[13px] cursor-pointer">
                                                                    SUBMIT
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Subsidy Disbursal Form */}
                                                    {activeTab === 'subsidyDisbursal' && (
                                                        <div>
                                                            <div className="font-bold text-[#1e293b] text-[16px] mb-1">Subsidy Disbursal</div>
                                                            <div className="text-gray-500 text-[13px] mb-4">Subsidy Disbursed Screenshot (Supports PDF, DOC, JPG, PNG, Max 5MB)</div>

                                                            <div className="border border-gray-300 rounded flex justify-between items-center p-1.5 bg-white mb-6">
                                                                <span className="text-gray-400 italic text-[14px] pl-3">No file selected</span>
                                                                <button className="bg-[#f59e0b] hover:bg-yellow-600 text-white px-5 py-1.5 rounded text-[14px] font-medium transition-colors cursor-pointer">Browse</button>
                                                            </div>

                                                            <div className="text-center mt-8">
                                                                <button className="bg-[#f59e0b] hover:bg-yellow-600 text-white px-8 py-2.5 font-bold rounded shadow-sm text-[13px] cursor-pointer">
                                                                    SUBMIT
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            </div >

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

export default FranchiseResidentialProjectManagement;
