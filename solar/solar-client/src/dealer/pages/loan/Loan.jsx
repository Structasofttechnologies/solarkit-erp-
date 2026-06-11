import React, { useState, useEffect } from 'react';
import {
    Search,
    User,
    Phone,
    Mail,
    Home,
    Building2,
    FileText,
    Upload,
    CheckCircle,
    XCircle,
    AlertCircle,
    Award,
    Banknote,
    Calendar,
    CreditCard,
    DollarSign,
    Percent,
    Clock,
    Shield,
    Check,
    X,
    Info,
    Image,
    Download,
    Printer,
    Share2,
    Heart,
    Star,
    Zap,
    Sun,
    Battery,
    TrendingUp,
    Briefcase,
    GraduationCap,
    Landmark,
    Wallet,
    PiggyBank,
    ArrowRight,
    ChevronDown,
    ChevronUp,
    Menu,
    Settings,
    CheckSquare
} from 'lucide-react';
import { projectAPI, loanAPI } from '../../../api/api';

const DealerLoan = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [applicationResult, setApplicationResult] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        applicantName: '',
        applicantAadhar: '',
        applicantPan: '',
        employmentType: '',
        downpayment: '',
        loanAmount: '',
        coApplicantName: '',
        coApplicantAadhar: '',
        coApplicantPan: '',
        coApplicantEmployment: '',
        documents: [],
        loanOption: ''
    });

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                const response = await projectAPI.getAll({ status: 'consumer' });
                setProjects(response.data.data || []);
            } catch (error) {
                console.error('Error fetching projects:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    // Filter projects based on search
    const filteredProjects = projects.filter(project =>
        project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.projectId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.mobile && project.mobile.includes(searchQuery))
    );

    // Wizard steps
    const steps = [
        'Eligibility',
        'Eligibility Check',
        'Additional Documents',
        'Apply',
        'Loan Providers',
        'Get Loan'
    ];

    // Static Loan offers (could be fetched from backend later)
    const loanOffers = [
        {
            id: 'loan1',
            bank: 'Citi Bank',
            plan: '5 Year Bonanza',
            amount: formData.loanAmount || 50000,
            interest: 10.00,
            emi: Math.round(((formData.loanAmount || 50000) * 1.1) / 60),
            recommended: true,
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Citibank.svg/512px-Citibank.svg.png'
        },
        {
            id: 'loan2',
            bank: 'EFL Loan',
            plan: '5 Year Loan Plan',
            amount: formData.loanAmount || 50000,
            interest: 9.00,
            emi: Math.round(((formData.loanAmount || 50000) * 1.09) / 60),
            recommended: false,
            logo: 'https://e-shram.gov.in/wp-content/uploads/2022/01/EFL_logo.png'
        }
    ];

    const documentTypes = [
        { id: 'photo', name: 'Customer Photo' },
        { id: 'aadharFront', name: 'Aadhar Card Front' },
        { id: 'aadharBack', name: 'Aadhar Card Back' },
        { id: 'pan', name: 'PAN Card' }
    ];

    const additionalDocuments = [
        { category: 'Project Documents', name: 'Light Bill', id: 'lightBill' },
        { category: 'Project Documents', name: 'Property OR Tax Bill', id: 'propertyTax' },
        { category: 'Loan Documents', name: 'Bank Statement (Min 1 Year)', id: 'bankStatement' },
        { category: 'Loan Documents', name: 'ITR Return (Min 2 Year)', id: 'itr' }
    ];

    const handleSelectProject = async (project) => {
        if (selectedProject?._id !== project._id) {
            setSelectedProject(project);
            setActiveStep(0);
            setApplicationResult(null);
            setLoading(true);

            try {
                // Check if loan application exists for this project
                const response = await loanAPI.getAll({ projectId: project._id });
                if (response.data.success && response.data.data.length > 0) {
                    setApplicationResult(response.data.data[0]);
                    setActiveStep(5); // Show final status step
                } else {
                    setFormData({
                        applicantName: project.projectName,
                        applicantAadhar: '',
                        applicantPan: '',
                        employmentType: '',
                        downpayment: '',
                        loanAmount: project.totalAmount,
                        coApplicantName: '',
                        coApplicantAadhar: '',
                        coApplicantPan: '',
                        coApplicantEmployment: '',
                        documents: [],
                        loanOption: ''
                    });
                }
            } catch (error) {
                console.error('Error checking existing loan:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            // Mock file upload - in real app, send to S3/Cloudinary and get URL
            const url = URL.createObjectURL(file);
            setFormData(prev => ({
                ...prev,
                documents: [...prev.documents, { type, url, name: file.name }]
            }));
            alert(`${type} uploaded successfully (Mock)`);
        }
    };

    const handleSubmit = async () => {
        if (!selectedProject) return alert('Please select a project');

        try {
            setSubmitting(true);
            const payload = {
                project: selectedProject._id,
                applicantName: formData.applicantName,
                applicantAadhar: formData.applicantAadhar,
                applicantPan: formData.applicantPan,
                employmentType: formData.employmentType,
                downpayment: Number(formData.downpayment),
                loanAmount: Number(formData.loanAmount),
                coApplicantName: formData.coApplicantName,
                coApplicantAadhar: formData.coApplicantAadhar,
                coApplicantPan: formData.coApplicantPan,
                coApplicantEmployment: formData.coApplicantEmployment,
                documents: formData.documents,
                loanType: 'bank',
                status: 'Pending'
            };

            const response = await loanAPI.create(payload);
            if (response.data.success) {
                setApplicationResult(response.data.data);
                setActiveStep(3); // Go to "Apply" step success screen
            }
        } catch (error) {
            console.error('Error submitting loan:', error);
            alert('Failed to submit application: ' + (error.response?.data?.message || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleLoanOptionSelect = (optionId) => {
        setFormData(prev => ({ ...prev, loanOption: optionId }));
        setActiveStep(5); // Go to "Get Loan" final step
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="mb-4">
                <div className="bg-white shadow-sm p-3">
                    <h3 className="text-xl font-semibold text-gray-800">Dealer Loans</h3>
                </div>
            </div>

            <div className="container-fluid px-4 py-4">
                <div className="flex flex-wrap">
                    {/* Left Side - Project List */}
                    <div className="w-full md:w-1/3 lg:w-1/4 pr-4">
                        <div className="bg-white rounded-sm shadow-sm p-4 mt-4 h-full border border-gray-100">
                            <h4 className="font-bold text-[18px] text-[#1e293b] mb-4">Apply For Loan</h4>
                            <div className="mb-4 relative">
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none placeholder-gray-400 font-medium"
                                    placeholder="Search Customer..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="space-y-0 max-h-[600px] overflow-y-auto">
                                {loading ? (
                                    <div className="text-center py-4">Loading projects...</div>
                                ) : filteredProjects.length > 0 ? filteredProjects.map((project) => (
                                    <button
                                        key={project._id}
                                        className={`w-full flex items-center p-3 mb-2 rounded border transition-all ${selectedProject?._id === project._id
                                            ? 'bg-[#007bff] text-white border-[#007bff]'
                                            : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'
                                            }`}
                                        onClick={() => handleSelectProject(project)}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${selectedProject?._id === project._id ? 'bg-white shadow-sm' : 'bg-[#e2e8f0]'}`}>
                                            <User size={20} className={selectedProject?._id === project._id ? 'text-[#007bff]' : 'text-gray-500'} />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="font-medium text-[13px] truncate">{project.projectName}</div>
                                            <div className={`text-[11px] font-medium mt-0.5 ${selectedProject?._id === project._id ? 'text-blue-100' : 'text-gray-500'}`}>
                                                Project: {project.projectId}
                                            </div>
                                        </div>
                                        <div className={`text-[10px] px-2 py-1 rounded font-bold ml-2 ${selectedProject?._id === project._id ? 'bg-[#5c636a] text-white' : 'bg-[#6c757d] text-white'}`}>
                                            6 Panel
                                        </div>
                                    </button>
                                )) : <div className="text-center py-4 text-gray-400 text-sm">No projects found</div>}
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Wizard */}
                    <div className="w-full md:w-2/3 lg:w-3/4">
                        <div className="bg-white rounded-lg shadow-sm border p-5 mt-4">
                            {/* Stepper */}
                            <div className="flex justify-between items-center mb-8 px-4 overflow-x-hidden relative">
                                {/* Background connecting line */}
                                <div className="absolute top-5 left-8 right-8 h-[2px] bg-gray-100 -z-10"></div>

                                {steps.map((step, index) => (
                                    <div key={index} className="flex flex-col items-center bg-white z-10 px-2">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-bold border-2 transition-all ${index === activeStep ? 'border-[#007bff] bg-white text-[#007bff] shadow-sm' :
                                            index < activeStep ? 'border-gray-200 bg-gray-100 text-gray-500' : 'border-gray-100 bg-white text-gray-400'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <span className={`text-[11px] mt-2 font-bold w-16 text-center leading-tight ${index === activeStep ? 'text-gray-600' : 'text-gray-400'}`}>
                                            {step.split(' ').map((word, i) => <React.Fragment key={i}>{word}<br /></React.Fragment>)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {!selectedProject ? (
                                <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Info className="text-blue-500" size={32} />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-700">Select a Project to Start</h4>
                                    <p className="text-gray-500 max-w-xs mx-auto mt-2">Choose a customer from the left sidebar to begin their loan application process.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {activeStep === 0 && (
                                        <div className="animate-fadeIn px-2">
                                            {/* Popular Combo Box */}
                                            <div className="border-[3px] border-[#ffc107] rounded-lg p-4 mb-4 flex justify-between items-center bg-white shadow-sm relative overflow-hidden">
                                                <div>
                                                    <h5 className="text-[#fd7e14] font-bold text-[11px] mb-1">Popular Combo</h5>
                                                    <h6 className="font-bold text-[13px] text-gray-800">6 Panel (2.7 KW)</h6>
                                                    <p className="font-black text-[14px] text-gray-900 leading-tight">₹1,00,000/-</p>
                                                </div>
                                                <div className="flex space-x-2 items-center relative z-10 w-28 justify-end">
                                                    <div className="w-10 h-10 bg-white border border-gray-100 shadow-sm flex items-center justify-center rounded"><Sun size={20} className="text-orange-500" /></div>
                                                    <div className="w-10 h-10 bg-[#0f172a] shadow-sm flex items-center justify-center rounded text-blue-300">
                                                        <div className="grid grid-cols-2 gap-[1px] w-5 h-6">
                                                            <div className="bg-blue-300/30"></div><div className="bg-blue-300/30"></div>
                                                            <div className="bg-blue-300/30"></div><div className="bg-blue-300/30"></div>
                                                            <div className="bg-blue-300/30"></div><div className="bg-blue-300/30"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <label className="block text-[12px] font-medium text-gray-700 mb-1">Project Price</label>
                                                <input type="text" disabled value="₹1,45,000/-" className="w-full px-3 py-2 border border-gray-200 bg-[#f8fafc] rounded text-[13px] text-gray-800 font-medium" />
                                            </div>

                                            <div className="mb-6">
                                                <h4 className="text-[#0ea5e9] font-bold text-[16px] mb-0 tracking-tight">Get Loans in Minutes!</h4>
                                                <p className="text-gray-400 text-[11px] font-medium pb-2 border-b border-gray-100 mb-3">You can loan up to 5 Lakh</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <input type="text" name="downpayment" value={formData.downpayment} onChange={handleInputChange} placeholder="Downpayment" className="w-full px-3 py-2.5 border border-gray-200 rounded text-[13px] placeholder-gray-400 focus:outline-none" />
                                                    <input type="text" name="loanAmount" value={formData.loanAmount} onChange={handleInputChange} placeholder="Loan Amount" className="w-full px-3 py-2.5 border border-gray-200 rounded text-[13px] placeholder-gray-400 focus:outline-none" />
                                                </div>
                                            </div>

                                            {/* Applicant Details */}
                                            <div className="border border-gray-200 rounded bg-white mb-6">
                                                <div className="px-4 py-3 border-b border-gray-200 font-bold text-[13px] text-[#334155] tracking-wide">
                                                    Applicant Details
                                                </div>
                                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white">
                                                    <input type="text" name="applicantName" value={formData.applicantName} onChange={handleInputChange} placeholder="Main Applicant" className="w-full px-3 py-2 border border-gray-200 rounded text-[12px] placeholder-gray-400 focus:outline-none" />
                                                    <input type="text" name="applicantAadhar" value={formData.applicantAadhar} onChange={handleInputChange} placeholder="Aadhar Number" className="w-full px-3 py-2 border border-gray-200 rounded text-[12px] placeholder-gray-400 focus:outline-none" />
                                                    <input type="text" name="applicantPan" value={formData.applicantPan} onChange={handleInputChange} placeholder="PAN Number" className="w-full px-3 py-2 border border-gray-200 rounded text-[12px] placeholder-gray-400 focus:outline-none" />
                                                    <select name="employmentType" value={formData.employmentType} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded text-[12px] text-gray-600 focus:outline-none">
                                                        <option value="">Select Employment Type</option>
                                                        <option value="Salaried">Salaried</option>
                                                        <option value="Self-Employed">Self-Employed</option>
                                                        <option value="Business">Business</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Documents Upload Table */}
                                            <div className="border border-gray-200 rounded bg-white mb-6 overflow-hidden">
                                                <div className="px-4 py-3 border-b border-gray-200 font-bold text-[13px] text-[#334155] tracking-wide bg-white">
                                                    Documents Upload
                                                </div>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead className="bg-[#7fbbf1] text-white">
                                                            <tr>
                                                                <th className="px-4 py-3 text-[12px] font-bold border-r border-[#96cbf6]">Document Type</th>
                                                                <th className="px-4 py-3 text-[12px] font-bold border-r border-[#96cbf6]">File</th>
                                                                <th className="px-4 py-3 text-[12px] font-bold w-24 text-center">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100">
                                                            {documentTypes.map(doc => (
                                                                <tr key={doc.id} className="bg-[#f8fafc]">
                                                                    <td className="px-4 py-3 text-[11px] font-bold text-gray-600 border-r border-gray-100 max-w-[150px]">
                                                                        {doc.name}
                                                                    </td>
                                                                    <td className="px-4 py-3 border-r border-gray-100">
                                                                        <div className="flex items-center bg-white border border-gray-200 rounded p-1">
                                                                            <button className="bg-gray-100 text-gray-700 text-[10px] font-medium px-2 py-1 rounded border border-gray-300 mr-2 whitespace-nowrap">Choose File</button>
                                                                            <span className="text-[11px] text-gray-400 truncate">No file chosen</span>
                                                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, doc.id)} />
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-center">
                                                                        <button className="bg-[#007bff] hover:bg-blue-600 text-white text-[10px] font-bold px-4 py-1.5 rounded shadow-sm">
                                                                            Upload
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Co-Applicant Details */}
                                            <div className="border border-gray-200 rounded bg-white mb-6">
                                                <div className="px-4 py-3 border-b border-gray-200 font-bold text-[13px] text-[#334155] tracking-wide">
                                                    Co-Applicant Details
                                                </div>
                                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white">
                                                    <input type="text" name="coApplicantName" value={formData.coApplicantName} onChange={handleInputChange} placeholder="Main Applicant" className="w-full px-3 py-2 border border-gray-200 rounded text-[12px] placeholder-gray-400 focus:outline-none" />
                                                    <input type="text" name="coApplicantAadhar" value={formData.coApplicantAadhar} onChange={handleInputChange} placeholder="Aadhar Number" className="w-full px-3 py-2 border border-gray-200 rounded text-[12px] placeholder-gray-400 focus:outline-none" />
                                                    <input type="text" name="coApplicantPan" value={formData.coApplicantPan} onChange={handleInputChange} placeholder="PAN Number" className="w-full px-3 py-2 border border-gray-200 rounded text-[12px] placeholder-gray-400 focus:outline-none" />
                                                    <select name="coApplicantEmployment" value={formData.coApplicantEmployment} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded text-[12px] text-gray-600 focus:outline-none">
                                                        <option value="">Select Employment Type</option>
                                                        <option value="Salaried">Salaried</option>
                                                        <option value="Self-Employed">Self-Employed</option>
                                                        <option value="Business">Business</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeStep === 1 && (
                                        <div className="bg-white border border-gray-100 rounded shadow-sm text-center py-10 px-6">
                                            <h4 className="text-[20px] font-bold text-[#0052cc] mb-1">Loan Eligibility Check</h4>
                                            <p className="text-gray-500 mb-8 text-[13px] font-medium">Click below to check your eligibility status.</p>

                                            <div className="flex justify-center space-x-6">
                                                <button className="bg-[#28a745] hover:bg-green-600 text-white font-bold py-2.5 px-8 rounded shadow-sm text-[13px] flex items-center transition-colors">
                                                    <CheckSquare size={16} className="mr-2" /> Eligible
                                                </button>
                                                <button className="bg-[#dc3545] hover:bg-red-600 text-white font-bold py-2.5 px-8 rounded shadow-sm text-[13px] flex items-center transition-colors">
                                                    <X size={16} className="mr-2" /> Not Eligible
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {activeStep === 2 && (
                                        <div className="animate-fadeIn">
                                            {/* Popular Combo Box */}
                                            <div className="border-[3px] border-[#ffc107] rounded-lg p-4 mb-4 flex justify-between items-center bg-white shadow-sm relative overflow-hidden">
                                                <div>
                                                    <h5 className="text-[#fd7e14] font-bold text-[11px] mb-1">Popular Combo</h5>
                                                    <h6 className="font-bold text-[13px] text-gray-800">6 Panel (2.7 KW)</h6>
                                                    <p className="font-black text-[14px] text-gray-900 leading-tight">₹1,00,000/-</p>
                                                </div>
                                                <div className="flex space-x-2 items-center relative z-10 w-28 justify-end">
                                                    <div className="w-10 h-10 bg-white border border-gray-100 shadow-sm flex items-center justify-center rounded"><Sun size={20} className="text-orange-500" /></div>
                                                    <div className="w-10 h-10 bg-[#0f172a] shadow-sm flex items-center justify-center rounded text-blue-300">
                                                        <div className="grid grid-cols-2 gap-[1px] w-5 h-6">
                                                            <div className="bg-blue-300/30"></div><div className="bg-blue-300/30"></div>
                                                            <div className="bg-blue-300/30"></div><div className="bg-blue-300/30"></div>
                                                            <div className="bg-blue-300/30"></div><div className="bg-blue-300/30"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="font-bold text-[14px] text-[#1e293b] mb-4">Required Documents</div>
                                            <div className="border border-gray-200 rounded overflow-hidden">
                                                <table className="w-full text-left border-collapse bg-white">
                                                    <thead className="bg-[#7fbbf1] text-white">
                                                        <tr>
                                                            <th className="px-4 py-3 text-[12px] font-bold border-r border-[#96cbf6] w-1/3">Category</th>
                                                            <th className="px-4 py-3 text-[12px] font-bold border-r border-[#96cbf6]">Document</th>
                                                            <th className="px-4 py-3 text-[12px] font-bold w-24 text-center">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100 text-[12px] text-gray-700 font-medium">
                                                        <tr>
                                                            <td className="px-4 py-3 border-r border-b border-gray-100 align-top" rowSpan={4}>Project Documents</td>
                                                            <td className="px-4 py-5 border-r border-gray-100">Light Bill</td>
                                                            <td className="px-4 py-5 text-center text-[#007bff] hover:text-blue-700 cursor-pointer text-[11px] font-bold"><label className="cursor-pointer">Upload<input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'lightBill')} /></label></td>
                                                        </tr>
                                                        <tr>
                                                            <td className="px-4 py-5 border-r border-gray-100">Property OR Tax Bill</td>
                                                            <td className="px-4 py-5 text-center text-[#007bff] hover:text-blue-700 cursor-pointer text-[11px] font-bold"><label className="cursor-pointer">Upload<input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'propertyTax')} /></label></td>
                                                        </tr>
                                                        <tr>
                                                            <td className="px-4 py-5 border-r border-gray-100">Dastaveg Copy (<span className="text-gray-400">Optional</span>)</td>
                                                            <td className="px-4 py-5 text-center text-[#007bff] hover:text-blue-700 cursor-pointer text-[11px] font-bold"><label className="cursor-pointer">Upload<input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'dastaveg')} /></label></td>
                                                        </tr>
                                                        <tr>
                                                            <td className="px-4 py-5 border-r border-gray-100">Quotation PDF</td>
                                                            <td className="px-4 py-5 text-center text-[#007bff] hover:text-blue-700 cursor-pointer text-[11px] font-bold"><label className="cursor-pointer">Upload<input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'quotation')} /></label></td>
                                                        </tr>
                                                        <tr>
                                                            <td className="px-4 py-3 border-r border-t border-gray-100 align-top" rowSpan={3}>Loan Documents</td>
                                                            <td className="px-4 py-5 border-r border-gray-100 border-t">Bank Statement (Min 1 Year)</td>
                                                            <td className="px-4 py-5 text-center text-[#007bff] hover:text-blue-700 cursor-pointer border-t border-gray-100 text-[11px] font-bold"><label className="cursor-pointer">Upload<input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'bankStatement')} /></label></td>
                                                        </tr>
                                                        <tr>
                                                            <td className="px-4 py-5 border-r border-gray-100">ITR Return (Min 2 Year)</td>
                                                            <td className="px-4 py-5 text-center text-[#007bff] hover:text-blue-700 cursor-pointer text-[11px] font-bold"><label className="cursor-pointer">Upload<input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'itr')} /></label></td>
                                                        </tr>
                                                        <tr>
                                                            <td className="px-4 py-5 border-r border-gray-100">Or Salary Slip</td>
                                                            <td className="px-4 py-5 text-center text-[#007bff] hover:text-blue-700 cursor-pointer text-[11px] font-bold"><label className="cursor-pointer">Upload<input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'salarySlip')} /></label></td>
                                                        </tr>
                                                        <tr>
                                                            <td className="px-4 py-5 border-r border-t border-gray-100"></td>
                                                            <td className="px-4 py-5 border-r border-t border-gray-100">Another Document (<span className="text-gray-400">Optional</span>)</td>
                                                            <td className="px-4 py-5 text-center text-[#007bff] hover:text-blue-700 cursor-pointer border-t border-gray-100 text-[11px] font-bold"><label className="cursor-pointer">Upload<input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'anotherDoc')} /></label></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {activeStep === 3 && (
                                        <div className="animate-fadeIn">
                                            {/* Popular Combo Box */}
                                            <div className="border-[3px] border-[#ffc107] rounded-lg p-4 mb-4 flex justify-between items-center bg-white shadow-sm relative overflow-hidden">
                                                <div>
                                                    <h5 className="text-[#fd7e14] font-bold text-[11px] mb-1">Popular Combo</h5>
                                                    <h6 className="font-bold text-[13px] text-gray-800">6 Panel (2.7 KW)</h6>
                                                    <p className="font-black text-[14px] text-gray-900 leading-tight">₹1,00,000/-</p>
                                                </div>
                                                <div className="flex space-x-2 items-center relative z-10 w-28 justify-end">
                                                    <div className="w-10 h-10 bg-white border border-gray-100 shadow-sm flex items-center justify-center rounded"><Sun size={20} className="text-orange-500" /></div>
                                                    <div className="w-10 h-10 bg-[#0f172a] shadow-sm flex items-center justify-center rounded text-blue-300">
                                                        <div className="grid grid-cols-2 gap-[1px] w-5 h-6">
                                                            <div className="bg-blue-300/30"></div><div className="bg-blue-300/30"></div>
                                                            <div className="bg-blue-300/30"></div><div className="bg-blue-300/30"></div>
                                                            <div className="bg-blue-300/30"></div><div className="bg-blue-300/30"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-2">
                                                <h4 className="text-[14px] font-bold text-gray-800">Payment Summary</h4>
                                                <span className="text-[11px] text-gray-500 font-medium tracking-wide">Project Number: Consumer Number</span>
                                            </div>

                                            <div className="flex items-center mb-6">
                                                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                                                    <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-[14px] text-[#0f172a]">Pardeep Singh</h5>
                                                    <p className="text-[12px] text-gray-500 mb-0">+91 96148xxxxx</p>
                                                    <p className="text-[12px] text-gray-500 mt-0">Email: pardeep@gmail.com</p>
                                                </div>
                                            </div>

                                            <div className="mb-6">
                                                <h5 className="font-bold text-[13px] text-[#334155] mb-2">Items / Products</h5>
                                                <div className="flex justify-between items-center bg-white p-0">
                                                    <div>
                                                        <h6 className="font-bold text-[13px] text-gray-800 mb-1">Solar Rooftop Kit</h6>
                                                        <p className="text-[12px] text-gray-500">6 Panel (2.7 KW)</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center mb-6 py-4 border-t border-b border-gray-100">
                                                <h5 className="font-bold text-[14px] text-gray-700">Downpayment</h5>
                                                <h5 className="font-black text-[14px] text-gray-800">₹{Number(formData.downpayment || 50000).toLocaleString()}/-</h5>
                                            </div>

                                            <div className="mb-6">
                                                <h5 className="font-bold text-[14px] text-gray-700 mb-3">Payment Method</h5>
                                                <div className="flex flex-col space-y-2">
                                                    <label className="flex items-center text-[13px] font-medium text-gray-700 cursor-pointer">
                                                        <input type="radio" name="paymentMethod" className="mr-2 accent-[#00a3ff]" defaultChecked /> Online
                                                    </label>
                                                    <label className="flex items-center text-[13px] font-medium text-gray-700 cursor-pointer">
                                                        <input type="radio" name="paymentMethod" className="mr-2 accent-[#00a3ff]" /> Offline
                                                    </label>
                                                </div>
                                                <button className="mt-4 bg-[#ffc107] text-gray-900 font-bold py-1.5 px-3 rounded text-[11px] flex items-center shadow-sm">
                                                    ₹{Number(formData.downpayment || 50000).toLocaleString()}/ Pay
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {activeStep === 4 && (
                                        <div className="animate-fadeIn">
                                            {/* Popular Combo Box */}
                                            <div className="border-[3px] border-[#ffc107] rounded-lg p-4 mb-4 flex justify-between items-center bg-white shadow-sm relative overflow-hidden">
                                                <div>
                                                    <h5 className="text-[#fd7e14] font-bold text-[11px] mb-1">Popular Combo</h5>
                                                    <h6 className="font-bold text-[13px] text-gray-800">6 Panel (2.7 KW)</h6>
                                                    <p className="font-black text-[14px] text-gray-900 leading-tight">₹1,00,000/-</p>
                                                </div>
                                                <div className="flex space-x-2 items-center relative z-10 w-28 justify-end">
                                                    <div className="w-10 h-10 bg-white border border-gray-100 shadow-sm flex items-center justify-center rounded"><Sun size={20} className="text-orange-500" /></div>
                                                    <div className="w-10 h-10 bg-[#0f172a] shadow-sm flex items-center justify-center rounded text-blue-300">
                                                        <div className="grid grid-cols-2 gap-[1px] w-5 h-6">
                                                            <div className="bg-blue-300/30"></div><div className="bg-blue-300/30"></div>
                                                            <div className="bg-blue-300/30"></div><div className="bg-blue-300/30"></div>
                                                            <div className="bg-blue-300/30"></div><div className="bg-blue-300/30"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                {loanOffers.map(offer => (
                                                    <label key={offer.id} className="block cursor-pointer">
                                                        <div className={`border rounded shadow-sm p-4 transition-all bg-white relative flex items-start ${formData.loanOption === offer.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}`}>
                                                            <input
                                                                type="radio"
                                                                name="loanProvider"
                                                                className="mt-1 mr-4 accent-[#00a3ff]"
                                                                checked={formData.loanOption === offer.id}
                                                                onChange={() => setFormData(prev => ({ ...prev, loanOption: offer.id }))}
                                                            />
                                                            <div className="flex-1">
                                                                {offer.recommended && <div className="bg-[#ffc107] inline-block text-gray-900 text-[10px] px-2 py-0.5 rounded font-bold mb-2">Recommended</div>}
                                                                <h5 className="font-bold text-gray-900 text-[14px] leading-tight mb-1">{offer.plan}</h5>
                                                                <p className="text-[12px] text-gray-500 mb-2">{offer.bank}</p>
                                                                <p className="text-[12px] text-gray-900 font-bold leading-tight mb-1">Amount: ₹{offer.amount.toLocaleString()}/-</p>
                                                                <p className="text-[12px] text-gray-900 font-bold leading-tight">Interest: {offer.interest.toFixed(2)}%</p>
                                                            </div>
                                                            <div className="text-right flex flex-col items-end">
                                                                {offer.logo ? (
                                                                    <img src={offer.logo} alt={offer.bank} className="h-6 object-contain mb-3" />
                                                                ) : (
                                                                    <div className="text-[10px] text-gray-400 mb-3"><Image size={24} className="mb-1 mx-auto" /> Bank Logo</div>
                                                                )}
                                                                <div>
                                                                    <p className="text-[11px] text-[#00a3ff] mb-0 leading-tight">Monthly EMI</p>
                                                                    <p className="text-[14px] text-[#00a3ff] font-bold leading-tight">₹{offer.emi.toLocaleString()}/-</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>

                                            <button
                                                className="w-full mt-6 bg-[#28a745] hover:bg-green-600 text-white font-bold py-3 rounded text-[13px] shadow-sm transition-colors"
                                                onClick={() => setActiveStep(5)}
                                            >
                                                Apply for Loan
                                            </button>
                                        </div>
                                    )}

                                    {activeStep === 5 && (
                                        <div className="text-center py-12">
                                            <div className="w-20 h-20 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                                                <Shield size={40} />
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Loan Applied Successfully</h3>
                                            {applicationResult && (
                                                <div className="bg-blue-50 border border-blue-100 rounded-lg py-2 px-4 mb-4 inline-block">
                                                    <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block">Application ID</span>
                                                    <span className="text-lg font-black text-blue-900">{applicationResult.applicationNumber}</span>
                                                </div>
                                            )}
                                            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                                                Your documents and provider selection have been sent to <strong>{loanOffers.find(o => o.id === formData.loanOption)?.bank || applicationResult?.bankName || 'our partners'}</strong> for final verification.
                                            </p>
                                            <div className="bg-gray-50 rounded-xl p-6 max-w-md mx-auto border border-dashed border-gray-300">
                                                <h5 className="font-bold text-gray-800 mb-4">What happens next?</h5>
                                                <ul className="text-sm text-left space-y-3">
                                                    <li className="flex items-start"><Check size={16} className="text-green-500 mr-2 mt-0.5" /> <span>Digital verification of documents (2 hours)</span></li>
                                                    <li className="flex items-start"><Check size={16} className="text-green-500 mr-2 mt-0.5" /> <span>Credit officer call for confirmation (24 hours)</span></li>
                                                    <li className="flex items-start"><Check size={16} className="text-green-500 mr-2 mt-0.5" /> <span>Sanction letter issuance (48 hours)</span></li>
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    {/* Navigation Buttons */}
                                    {activeStep < 4 && (
                                        <div className="pt-2">
                                            {/* Navigation Buttons for other steps are handled at the top, modifying inner wizard controls specifically */}
                                            {activeStep > 0 && activeStep < 4 ? (
                                                <div className="flex justify-end pt-4 mt-8">
                                                    <button
                                                        onClick={() => setActiveStep(prev => prev - 1)}
                                                        className="px-6 py-2 border border-[#00a3ff] text-[#00a3ff] bg-white rounded text-[13px] font-bold hover:bg-blue-50 transition-colors mr-3"
                                                    >
                                                        Previous
                                                    </button>
                                                    <button
                                                        onClick={() => setActiveStep(prev => prev + 1)}
                                                        className="px-8 py-2 bg-[#00a3ff] text-white rounded text-[13px] font-bold hover:bg-blue-500 transition-colors shadow-sm"
                                                    >
                                                        {activeStep === 3 ? 'Submit' : 'Next'}
                                                    </button>
                                                </div>
                                            ) : activeStep === 0 ? (
                                                <>
                                                    <button className="w-full bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 font-bold py-2.5 rounded shadow-sm text-[13px] mb-4 transition-colors">
                                                        Eligibility Check
                                                    </button>
                                                    <div className="flex justify-end pt-4 border-t mt-4 border-gray-100">
                                                        <button
                                                            onClick={() => setActiveStep(prev => prev + 1)}
                                                            className="px-8 py-2 bg-[#00a3ff] hover:bg-blue-500 text-white rounded text-[13px] font-bold shadow-sm transition-colors"
                                                        >
                                                            Next
                                                        </button>
                                                    </div>
                                                </>
                                            ) : null}
                                        </div>
                                    )}

                                    {activeStep === 5 && (
                                        <div className="text-center pt-8 border-t">
                                            <button
                                                onClick={() => {
                                                    setActiveStep(0);
                                                    setSelectedProject(null);
                                                    setFormData({
                                                        applicantName: '', applicantAadhar: '', applicantPan: '', employmentType: '',
                                                        downpayment: '', loanAmount: '', coApplicantName: '', coApplicantAadhar: '',
                                                        coApplicantPan: '', coApplicantEmployment: '', documents: [], loanOption: ''
                                                    });
                                                }}
                                                className="px-10 py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-black transition-all"
                                            >
                                                Apply New Loan
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx="true">{`
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default DealerLoan;