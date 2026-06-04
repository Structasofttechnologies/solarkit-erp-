import React, { useState, useEffect } from 'react';
import {
    User,
    Phone,
    Mail,
    MapPin,
    FileText,
    CheckCircle,
    XCircle,
    ChevronRight,
    ChevronLeft,
    Search,
    Upload,
    Eye,
    Edit,
    Home,
    Building2,
    CreditCard,
    Calendar,
    Lock,
    Unlock,
    AlertCircle,
    Check,
    X,
    Plus,
    Minus,
    Star,
    Download,
    Share2,
    Camera,
    Image as ImageIcon,
    DollarSign,
    Percent,
    Banknote,
    Shield,
    Clock,
    ThumbsUp,
    ThumbsDown,
    Award,
    TrendingUp,
    Wallet,
    PiggyBank,
    Landmark
} from 'lucide-react';

const FranchiseeLoans = () => {
    // State for selected customer
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // State for search term
    const [searchTerm, setSearchTerm] = useState('');

    // State for active wizard step
    const [activeStep, setActiveStep] = useState(0);

    // State for loan form data
    const [loanData, setLoanData] = useState({
        downpayment: '',
        loanAmount: '',
        loanDuration: '12 Months',
        interestRate: '8%',
        mainApplicant: '',
        aadharNumber: '',
        panNumber: '',
        employmentType: '',
        coApplicant: '',
        coAadharNumber: '',
        coPanNumber: '',
        coEmploymentType: ''
    });

    // State for uploaded files
    const [uploadedFiles, setUploadedFiles] = useState({
        customerPhoto: null,
        aadharFront: null,
        aadharBack: null,
        panCard: null,
        coCustomerPhoto: null,
        coAadharFront: null,
        coAadharBack: null,
        coPanCard: null,
        lightBill: null,
        propertyTax: null,
        dastavegCopy: null,
        quotationPDF: null,
        bankStatement: null,
        itrReturn: null,
        salarySlip: null,
        otherDocument: null
    });

    // State for eligibility result
    const [eligibilityResult, setEligibilityResult] = useState(null);

    // State for showing co-applicant documents
    const [showCoApplicantDocs, setShowCoApplicantDocs] = useState(false);

    // State for selected loan option
    const [selectedLoanOption, setSelectedLoanOption] = useState(null);

    // State for payment method
    const [paymentMethod, setPaymentMethod] = useState('online');

    // Customers data
    const customers = [
        {
            id: 1,
            name: 'Pardeep Singh',
            phone: '+91 9814812345',
            project: 'PRJ-001',
            consumer: 'CN-001',
            panel: '6 Panel (2.7 KW)',
            image: '../../assets/vendors/images/profile.png',
            projectPrice: 145000,
            comboPrice: 100000
        },
        {
            id: 2,
            name: 'Rahul Sharma',
            phone: '+91 9876543210',
            project: 'PRJ-002',
            consumer: 'CN-002',
            panel: '8 Panel (3.6 KW)',
            image: '../../assets/vendors/images/profile.png',
            projectPrice: 165000,
            comboPrice: 120000
        },
        {
            id: 3,
            name: 'Priya Patel',
            phone: '+91 8765432109',
            project: 'PRJ-003',
            consumer: 'CN-003',
            panel: '10 Panel (4.5 KW)',
            image: '../../assets/vendors/images/profile.png',
            projectPrice: 185000,
            comboPrice: 140000
        },
        {
            id: 4,
            name: 'Amit Kumar',
            phone: '+91 9876543211',
            project: 'PRJ-004',
            consumer: 'CN-004',
            panel: '6 Panel (2.7 KW)',
            image: '../../assets/vendors/images/profile.png',
            projectPrice: 145000,
            comboPrice: 100000
        },
        {
            id: 5,
            name: 'Neha Gupta',
            phone: '+91 9876543212',
            project: 'PRJ-005',
            consumer: 'CN-005',
            panel: '8 Panel (3.6 KW)',
            image: '../../assets/vendors/images/profile.png',
            projectPrice: 165000,
            comboPrice: 120000
        }
    ];

    // Loan offers data
    const loanOffers = [
        {
            id: 1,
            bank: 'Citi Bank',
            plan: '5 Year Bonanza',
            amount: 50000,
            interest: 10.00,
            emi: 3851,
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Citibank.svg/512px-Citibank.svg.png',
            recommended: true
        },
        {
            id: 2,
            bank: 'EFL Loan',
            plan: '5 Year Loan Plan',
            amount: 50000,
            interest: 9.00,
            emi: 3600,
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/EFL_logo.png/320px-EFL_logo.png',
            recommended: false
        },
        {
            id: 3,
            bank: 'HDFC Bank',
            plan: 'HDFC Loan Plus',
            amount: 50000,
            interest: 12.00,
            emi: 3850,
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/HDFC_Bank_Logo.svg/512px-HDFC_Bank_Logo.svg.png',
            recommended: true
        }
    ];

    // Wizard steps
    const steps = [
        'Eligibility',
        'Eligibility Check',
        'Additional Documents',
        'Apply',
        'Loan Providers',
        'Get Loan'
    ];

    // Set default selected customer
    useEffect(() => {
        setSelectedCustomer(customers[0]);
    }, []);

    // Filter customers based on search term
    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
    );

    // Handle customer selection
    const handleCustomerSelect = (customer) => {
        setSelectedCustomer(customer);
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLoanData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle file upload
    const handleFileUpload = (e, fieldName) => {
        const file = e.target.files[0];
        if (file) {
            setUploadedFiles(prev => ({
                ...prev,
                [fieldName]: file
            }));
        }
    };

    // Handle eligibility check
    const handleEligibilityCheck = () => {
        // In a real app, this would make an API call
        alert('Eligibility check initiated');
    };

    // Handle eligibility result
    const showEligibilityResult = (type) => {
        if (type === 'eligible') {
            setEligibilityResult({
                status: 'eligible',
                message: '🎉 Congratulations! You are Eligible for Loan.',
                reason: '',
                icon: 'https://cdn-icons-png.flaticon.com/512/190/190411.png'
            });
            setShowCoApplicantDocs(true);
        } else {
            setEligibilityResult({
                status: 'notEligible',
                message: '❌ Sorry! You are Not Eligible for Loan.',
                reason: 'Reason: Low credit score and insufficient income details.',
                icon: 'https://cdn-icons-png.flaticon.com/512/463/463612.png'
            });
            setShowCoApplicantDocs(false);
        }
    };

    // Handle next step
    const handleNextStep = () => {
        if (activeStep < steps.length - 1) {
            setActiveStep(activeStep + 1);
        }
    };

    // Handle previous step
    const handlePrevStep = () => {
        if (activeStep > 0) {
            setActiveStep(activeStep - 1);
        }
    };

    // Handle loan apply
    const handleLoanApply = () => {
        if (selectedLoanOption) {
            alert(`Loan application submitted for ${selectedLoanOption.plan}`);
            handleNextStep();
        } else {
            alert('Please select a loan option');
        }
    };

    // Handle payment
    const handlePayment = () => {
        alert(`Payment of ₹${loanData.downpayment || 50000} initiated via ${paymentMethod}`);
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="mb-4">
                <nav className="bg-white rounded-lg shadow-sm p-4">
                    <ol className="flex items-center">
                        <li className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900">Franchisee Loans</h3>
                        </li>
                    </ol>
                </nav>
            </div>

            <div className="flex flex-col lg:flex-row px-4">
                {/* Left Sidebar */}
                <div className="lg:w-1/3 pr-0 lg:pr-4 mb-4 lg:mb-0">
                    <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
                        <h3 className="text-lg font-bold mb-3">Apply For Loan</h3>

                        {/* Search */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search Customer..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Customer List */}
                        <div className="space-y-2 max-h-[500px] overflow-y-auto">
                            {filteredCustomers.map((customer) => (
                                <button
                                    key={customer.id}
                                    onClick={() => handleCustomerSelect(customer)}
                                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${selectedCustomer?.id === customer.id
                                            ? 'bg-blue-50 border border-blue-300'
                                            : 'hover:bg-gray-50 border border-transparent'
                                        }`}
                                >
                                    <img
                                        src={customer.image}
                                        alt={customer.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div className="flex-1 text-left ml-3">
                                        <div className="font-semibold text-sm">{customer.name}</div>
                                        <div className="text-xs text-gray-500">Project: {customer.project}</div>
                                    </div>
                                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                                        {customer.panel.split(' ')[0]} {customer.panel.split(' ')[1]}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Content - Wizard */}
                <div className="lg:w-2/3">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        {/* Stepper */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                {steps.map((step, index) => (
                                    <React.Fragment key={index}>
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${index <= activeStep
                                                        ? 'bg-orange-500 text-white'
                                                        : 'bg-gray-200 text-gray-600'
                                                    }`}
                                            >
                                                {index + 1}
                                            </div>
                                            <span className={`text-xs mt-1 ${index === activeStep ? 'text-orange-500 font-semibold' : 'text-gray-500'}`}>
                                                {step}
                                            </span>
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div className={`flex-1 h-0.5 mx-2 ${index < activeStep ? 'bg-orange-500' : 'bg-gray-200'}`} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* Step 1: Eligibility */}
                        {activeStep === 0 && selectedCustomer && (
                            <div>
                                {/* Combo Card */}
                                <div className="border-4 border-orange-500 rounded-lg p-4 mb-4 flex items-center justify-between">
                                    <div>
                                        <h6 className="text-orange-500 font-semibold mb-1">Popular Combo</h6>
                                        <p className="text-sm mb-1">{selectedCustomer.panel}</p>
                                        <strong className="text-lg">₹{selectedCustomer.comboPrice.toLocaleString()}/-</strong>
                                    </div>
                                    <div className="flex gap-2">
                                        <img
                                            src="../../assets/vendors/images/solarcompany.png"
                                            className="w-16 h-12 object-contain"
                                            alt="Solar Company"
                                        />
                                        <img
                                            src="../../assets/vendors/images/solarpanel.png"
                                            className="w-16 h-12 object-contain"
                                            alt="Solar Panel"
                                        />
                                    </div>
                                </div>

                                {/* Project Price */}
                                <div className="mb-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Project Price</label>
                                    <p className="border border-gray-300 rounded-md p-3 bg-gray-50">
                                        ₹{selectedCustomer.projectPrice.toLocaleString()}/-
                                    </p>
                                </div>

                                {/* Loan Section */}
                                <div className="mb-6">
                                    <h5 className="text-blue-600 font-semibold mb-2">Get Loans in Minutes!</h5>
                                    <p className="text-sm text-gray-500 mb-3">You can loan up to 5 Lakh</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                        <div>
                                            <input
                                                type="number"
                                                name="downpayment"
                                                value={loanData.downpayment}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Downpayment"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="number"
                                                name="loanAmount"
                                                value={loanData.loanAmount}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Loan Amount"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Applicant Details */}
                                <div className="border rounded-lg mb-4">
                                    <div className="bg-gray-50 px-4 py-2 border-b font-semibold">Applicant Details</div>
                                    <div className="p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                name="mainApplicant"
                                                value={loanData.mainApplicant}
                                                onChange={handleInputChange}
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Main Applicant"
                                            />
                                            <input
                                                type="text"
                                                name="aadharNumber"
                                                value={loanData.aadharNumber}
                                                onChange={handleInputChange}
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Aadhar Number"
                                            />
                                            <input
                                                type="text"
                                                name="panNumber"
                                                value={loanData.panNumber}
                                                onChange={handleInputChange}
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="PAN Number"
                                            />
                                            <select
                                                name="employmentType"
                                                value={loanData.employmentType}
                                                onChange={handleInputChange}
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select Employment Type</option>
                                                <option value="Salaried">Salaried</option>
                                                <option value="Self-Employed">Self-Employed</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Documents Upload */}
                                <div className="border rounded-lg mb-4">
                                    <div className="bg-gray-50 px-4 py-2 border-b font-semibold">Documents Upload</div>
                                    <div className="p-4">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full border">
                                                <thead className="bg-gray-100">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-sm font-semibold">Document Type</th>
                                                        <th className="px-4 py-2 text-left text-sm font-semibold">File</th>
                                                        <th className="px-4 py-2 text-left text-sm font-semibold">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {[
                                                        { label: 'Customer Photo', field: 'customerPhoto' },
                                                        { label: 'Aadhar Card Front', field: 'aadharFront' },
                                                        { label: 'Aadhar Card Back', field: 'aadharBack' },
                                                        { label: 'PAN Card', field: 'panCard' }
                                                    ].map((doc, index) => (
                                                        <tr key={index} className="border-t">
                                                            <td className="px-4 py-2 text-sm">{doc.label}</td>
                                                            <td className="px-4 py-2">
                                                                <input
                                                                    type="file"
                                                                    onChange={(e) => handleFileUpload(e, doc.field)}
                                                                    className="w-full text-sm border border-gray-300 rounded-md p-1"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700">
                                                                    Upload
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Co-Applicant Details */}
                                <div className="border rounded-lg mb-4">
                                    <div className="bg-gray-50 px-4 py-2 border-b font-semibold">Co-Applicant Details</div>
                                    <div className="p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                name="coApplicant"
                                                value={loanData.coApplicant}
                                                onChange={handleInputChange}
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Co-Applicant Name"
                                            />
                                            <input
                                                type="text"
                                                name="coAadharNumber"
                                                value={loanData.coAadharNumber}
                                                onChange={handleInputChange}
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Aadhar Number"
                                            />
                                            <input
                                                type="text"
                                                name="coPanNumber"
                                                value={loanData.coPanNumber}
                                                onChange={handleInputChange}
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="PAN Number"
                                            />
                                            <select
                                                name="coEmploymentType"
                                                value={loanData.coEmploymentType}
                                                onChange={handleInputChange}
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select Employment Type</option>
                                                <option value="Salaried">Salaried</option>
                                                <option value="Self-Employed">Self-Employed</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Eligibility Check Button */}
                                <button
                                    onClick={handleEligibilityCheck}
                                    className="w-full py-3 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition-colors"
                                >
                                    Eligibility Check
                                </button>
                            </div>
                        )}

                        {/* Step 2: Eligibility Check */}
                        {activeStep === 1 && (
                            <div className="p-6 text-center">
                                <h4 className="text-blue-600 font-bold text-xl mb-3">Loan Eligibility Check</h4>
                                <p className="text-gray-500 mb-4">Click below to check your eligibility status.</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <button
                                        onClick={() => showEligibilityResult('eligible')}
                                        className="py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 flex items-center justify-center"
                                    >
                                        <CheckCircle size={18} className="mr-2" /> Eligible
                                    </button>
                                    <button
                                        onClick={() => showEligibilityResult('notEligible')}
                                        className="py-3 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 flex items-center justify-center"
                                    >
                                        <XCircle size={18} className="mr-2" /> Not Eligible
                                    </button>
                                </div>

                                {/* Result Section */}
                                {eligibilityResult && (
                                    <div className="mt-4 p-6 border rounded-lg">
                                        <img
                                            src={eligibilityResult.icon}
                                            alt="Result"
                                            className="w-24 h-24 mx-auto mb-3 object-contain"
                                        />
                                        <h5 className={`text-lg font-bold mb-2 ${eligibilityResult.status === 'eligible' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {eligibilityResult.message}
                                        </h5>
                                        {eligibilityResult.reason && (
                                            <p className="text-gray-500">{eligibilityResult.reason}</p>
                                        )}
                                    </div>
                                )}

                                {/* Co-Applicant Documents */}
                                {showCoApplicantDocs && (
                                    <div className="border rounded-lg mt-6">
                                        <div className="bg-gray-50 px-4 py-2 border-b font-semibold">Co-Applicant Documents</div>
                                        <div className="p-4">
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full border">
                                                    <thead className="bg-gray-100">
                                                        <tr>
                                                            <th className="px-4 py-2 text-left text-sm font-semibold">Document Type</th>
                                                            <th className="px-4 py-2 text-left text-sm font-semibold">File</th>
                                                            <th className="px-4 py-2 text-left text-sm font-semibold">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {[
                                                            { label: 'Customer Photo', field: 'coCustomerPhoto' },
                                                            { label: 'Aadhar Card Front', field: 'coAadharFront' },
                                                            { label: 'Aadhar Card Back', field: 'coAadharBack' },
                                                            { label: 'PAN Card', field: 'coPanCard' }
                                                        ].map((doc, index) => (
                                                            <tr key={index} className="border-t">
                                                                <td className="px-4 py-2 text-sm">{doc.label}</td>
                                                                <td className="px-4 py-2">
                                                                    <input
                                                                        type="file"
                                                                        onChange={(e) => handleFileUpload(e, doc.field)}
                                                                        className="w-full text-sm border border-gray-300 rounded-md p-1"
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-2">
                                                                    <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700">
                                                                        Upload
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 3: Additional Documents */}
                        {activeStep === 2 && selectedCustomer && (
                            <div>
                                {/* Combo Card */}
                                <div className="border-4 border-orange-500 rounded-lg p-4 mb-4 flex items-center justify-between">
                                    <div>
                                        <h6 className="text-orange-500 font-semibold mb-1">Popular Combo</h6>
                                        <p className="text-sm mb-1">{selectedCustomer.panel}</p>
                                        <strong className="text-lg">₹{selectedCustomer.comboPrice.toLocaleString()}/-</strong>
                                    </div>
                                    <div className="flex gap-2">
                                        <img
                                            src="../../assets/vendors/images/solarcompany.png"
                                            className="w-16 h-12 object-contain"
                                            alt="Solar Company"
                                        />
                                        <img
                                            src="../../assets/vendors/images/solarpanel.png"
                                            className="w-16 h-12 object-contain"
                                            alt="Solar Panel"
                                        />
                                    </div>
                                </div>

                                <h6 className="font-semibold mb-3">Required Documents</h6>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-sm font-semibold">Category</th>
                                                <th className="px-4 py-2 text-left text-sm font-semibold">Document</th>
                                                <th className="px-4 py-2 text-left text-sm font-semibold">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* Project Documents */}
                                            <tr>
                                                <td rowSpan="4" className="px-4 py-2 border-r align-top font-medium">Project Documents</td>
                                                <td className="px-4 py-2 border-t">Light Bill</td>
                                                <td className="px-4 py-2 border-t">
                                                    <button className="px-3 py-1 border border-blue-600 text-blue-600 text-xs rounded-md hover:bg-blue-50">
                                                        Upload
                                                    </button>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2">Property OR Tax Bill</td>
                                                <td className="px-4 py-2">
                                                    <button className="px-3 py-1 border border-blue-600 text-blue-600 text-xs rounded-md hover:bg-blue-50">
                                                        Upload
                                                    </button>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2">Dastaveg Copy (Optional)</td>
                                                <td className="px-4 py-2">
                                                    <button className="px-3 py-1 border border-blue-600 text-blue-600 text-xs rounded-md hover:bg-blue-50">
                                                        Upload
                                                    </button>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2">Quotation PDF</td>
                                                <td className="px-4 py-2">
                                                    <button className="px-3 py-1 border border-blue-600 text-blue-600 text-xs rounded-md hover:bg-blue-50">
                                                        Upload
                                                    </button>
                                                </td>
                                            </tr>

                                            {/* Loan Documents */}
                                            <tr>
                                                <td rowSpan="4" className="px-4 py-2 border-r align-top font-medium">Loan Documents</td>
                                                <td className="px-4 py-2 border-t">Bank Statement (Min 1 Year)</td>
                                                <td className="px-4 py-2 border-t">
                                                    <button className="px-3 py-1 border border-blue-600 text-blue-600 text-xs rounded-md hover:bg-blue-50">
                                                        Upload
                                                    </button>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2">ITR Return (Min 2 Year)</td>
                                                <td className="px-4 py-2">
                                                    <button className="px-3 py-1 border border-blue-600 text-blue-600 text-xs rounded-md hover:bg-blue-50">
                                                        Upload
                                                    </button>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2">Or Salary Slip</td>
                                                <td className="px-4 py-2">
                                                    <button className="px-3 py-1 border border-blue-600 text-blue-600 text-xs rounded-md hover:bg-blue-50">
                                                        Upload
                                                    </button>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2">Another Document (Optional)</td>
                                                <td className="px-4 py-2">
                                                    <button className="px-3 py-1 border border-blue-600 text-blue-600 text-xs rounded-md hover:bg-blue-50">
                                                        Upload
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Apply */}
                        {activeStep === 3 && (
                            <div className="p-6 text-center">
                                <div className="flex justify-center mb-4">
                                    <img
                                        src="../../assets/vendors/images/images.jpeg"
                                        className="w-24 h-24 rounded-full shadow-md object-cover"
                                        alt="Success"
                                    />
                                </div>

                                <h4 className="text-blue-600 font-bold text-xl mb-3">Thanks For the Loan Application</h4>

                                <p className="text-gray-500 mb-4">
                                    Your application is under process.<br />
                                    Check Loan Section For Status Of Your Loan Application.
                                </p>

                                <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 mb-4">
                                    Loan Application Number <br />
                                    <span className="text-lg">#59df6g5565</span>
                                </button>

                                <p className="text-gray-500">
                                    For Any Query Or Information <br />
                                    <span className="font-bold">+91 98114xxxxx</span> <br />
                                    info@solarkits.com
                                </p>
                            </div>
                        )}

                        {/* Step 5: Loan Providers */}
                        {activeStep === 4 && selectedCustomer && (
                            <div>
                                {/* Combo Card */}
                                <div className="border-4 border-orange-500 rounded-lg p-4 mb-4 flex items-center justify-between">
                                    <div>
                                        <h6 className="text-orange-500 font-semibold mb-1">Popular Combo</h6>
                                        <p className="text-sm mb-1">{selectedCustomer.panel}</p>
                                        <strong className="text-lg">₹{selectedCustomer.comboPrice.toLocaleString()}/-</strong>
                                    </div>
                                    <div className="flex gap-2">
                                        <img
                                            src="../../assets/vendors/images/solarcompany.png"
                                            className="w-16 h-12 object-contain"
                                            alt="Solar Company"
                                        />
                                        <img
                                            src="../../assets/vendors/images/solarpanel.png"
                                            className="w-16 h-12 object-contain"
                                            alt="Solar Panel"
                                        />
                                    </div>
                                </div>

                                {/* Loan Offers */}
                                <div className="space-y-3">
                                    {loanOffers.map((offer) => (
                                        <div
                                            key={offer.id}
                                            className={`border rounded-lg p-4 transition-all ${selectedLoanOption?.id === offer.id
                                                    ? 'border-blue-500 ring-2 ring-blue-200'
                                                    : 'border-gray-200 hover:shadow-md'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="radio"
                                                        name="loanOption"
                                                        checked={selectedLoanOption?.id === offer.id}
                                                        onChange={() => setSelectedLoanOption(offer)}
                                                        className="mt-1 h-4 w-4 text-blue-600"
                                                    />
                                                    <div>
                                                        {offer.recommended && (
                                                            <span className="inline-block bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-1 rounded mb-2">
                                                                Recommended
                                                            </span>
                                                        )}
                                                        <h6 className="font-bold">{offer.plan}</h6>
                                                        <p className="text-sm text-gray-500">{offer.bank}</p>
                                                        <div className="text-sm mt-1">
                                                            <div><strong>Amount:</strong> ₹{offer.amount.toLocaleString()}/-</div>
                                                            <div><strong>Interest:</strong> {offer.interest}%</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <img
                                                        src={offer.logo}
                                                        alt={offer.bank}
                                                        className="h-8 object-contain mb-2 ml-auto"
                                                    />
                                                    <div className="font-bold text-blue-600">
                                                        Monthly EMI<br />₹{offer.emi.toLocaleString()}/-
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Apply Button */}
                                <button
                                    onClick={handleLoanApply}
                                    className="w-full mt-4 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700"
                                >
                                    Apply for Loan
                                </button>
                            </div>
                        )}

                        {/* Step 6: Get Loan */}
                        {activeStep === 5 && selectedCustomer && (
                            <div>
                                {/* Combo Card */}
                                <div className="border-4 border-orange-500 rounded-lg p-4 mb-4 flex items-center justify-between">
                                    <div>
                                        <h6 className="text-orange-500 font-semibold mb-1">Popular Combo</h6>
                                        <p className="text-sm mb-1">{selectedCustomer.panel}</p>
                                        <strong className="text-lg">₹{selectedCustomer.comboPrice.toLocaleString()}/-</strong>
                                    </div>
                                    <div className="flex gap-2">
                                        <img
                                            src="../../assets/vendors/images/solarcompany.png"
                                            className="w-16 h-12 object-contain"
                                            alt="Solar Company"
                                        />
                                        <img
                                            src="../../assets/vendors/images/solarpanel.png"
                                            className="w-16 h-12 object-contain"
                                            alt="Solar Panel"
                                        />
                                    </div>
                                </div>

                                {/* Payment Summary */}
                                <div className="border rounded-lg shadow-sm">
                                    <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                                        <span className="font-semibold">Payment Summary</span>
                                        <small className="text-gray-500">Project Number: {selectedCustomer.consumer}</small>
                                    </div>
                                    <div className="p-4">
                                        {/* User Info */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <img
                                                src={selectedCustomer.image}
                                                alt={selectedCustomer.name}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                            <div>
                                                <h6 className="font-bold">{selectedCustomer.name}</h6>
                                                <small className="text-gray-500 block">{selectedCustomer.phone}</small>
                                                <small className="text-gray-500">Email: {selectedCustomer.name.toLowerCase().replace(' ', '.')}@gmail.com</small>
                                            </div>
                                        </div>

                                        {/* Product Info */}
                                        <p className="font-semibold mb-1">Items / Products</p>
                                        <p className="mb-3">
                                            Solar Rooftop Kit<br />
                                            <small className="text-gray-500">{selectedCustomer.panel}</small>
                                        </p>

                                        {/* Downpayment */}
                                        <div className="flex justify-between border-t pt-3 mb-3">
                                            <span>Downpayment</span>
                                            <span className="font-bold">₹{loanData.downpayment || '50,000'}/-</span>
                                        </div>

                                        {/* Payment Method */}
                                        <p className="font-semibold mb-2">Payment Method</p>
                                        <div className="space-y-2 mb-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    value="online"
                                                    checked={paymentMethod === 'online'}
                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                    className="h-4 w-4 text-blue-600"
                                                />
                                                <span className="ml-2 text-sm">Online</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    value="offline"
                                                    checked={paymentMethod === 'offline'}
                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                    className="h-4 w-4 text-blue-600"
                                                />
                                                <span className="ml-2 text-sm">Offline</span>
                                            </label>
                                        </div>

                                        {/* Pay Button */}
                                        <button
                                            onClick={handlePayment}
                                            className="w-full py-3 bg-orange-500 text-white font-bold rounded-md hover:bg-orange-600"
                                        >
                                            ₹{loanData.downpayment || '50,000'}/- Pay
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-6">
                            <button
                                onClick={handlePrevStep}
                                disabled={activeStep === 0}
                                className={`px-4 py-2 rounded-md flex items-center ${activeStep === 0
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-500 text-white hover:bg-gray-600'
                                    }`}
                            >
                                <ChevronLeft size={16} className="mr-1" /> Previous
                            </button>
                            <button
                                onClick={handleNextStep}
                                disabled={activeStep === steps.length - 1}
                                className={`px-4 py-2 rounded-md flex items-center ${activeStep === steps.length - 1
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                Next <ChevronRight size={16} className="ml-1" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FranchiseeLoans;