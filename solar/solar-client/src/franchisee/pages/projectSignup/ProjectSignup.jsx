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
    Image as ImageIcon
} from 'lucide-react';

const FranchiseProjectSignup = () => {
    // State for active wizard tab
    const [activeTab, setActiveTab] = useState('personal');

    // State for selected project
    const [selectedProject, setSelectedProject] = useState(null);

    // State for search term
    const [searchTerm, setSearchTerm] = useState('');

    // State for account details visibility
    const [showAccountDetails, setShowAccountDetails] = useState(false);

    // State for location modal
    const [showLocationModal, setShowLocationModal] = useState(false);

    // State for location search
    const [locationSearch, setLocationSearch] = useState('');

    // State for summary address
    const [summaryAddress, setSummaryAddress] = useState('Narayan Nagar, Mavdi main road rajkot');

    // State for form data
    const [formData, setFormData] = useState({
        aadharNumber: '123456789012',
        lightBillNumber: '1234567890',
        nameAsPerAadhar: 'Sushil Piprotar',
        nameAsPerBill: 'Sushil Piprotar',
        bankAccount: '',
        ifscCode: '',
        accountHolderName: ''
    });

    // State for uploaded files
    const [uploadedFiles, setUploadedFiles] = useState({
        customerPhoto: null,
        electricityBill: null,
        cancelCheque: null,
        uploadDocument: null
    });

    // Projects data
    const projects = [
        {
            id: 1,
            name: 'Pardeep Singh',
            phone: '+91 9814812345',
            project: 'PRJ-001',
            consumer: 'CN-001',
            panel: '6 Panel (2.7 KW)',
            image: '../../assets/vendors/images/profile.png'
        },
        {
            id: 2,
            name: 'Rahul Sharma',
            phone: '+91 9876543210',
            project: 'PRJ-002',
            consumer: 'CN-002',
            panel: '8 Panel (3.6 KW)',
            image: '../../assets/vendors/images/profile.png'
        },
        {
            id: 3,
            name: 'Priya Patel',
            phone: '+91 8765432109',
            project: 'PRJ-003',
            consumer: 'CN-003',
            panel: '10 Panel (4.5 KW)',
            image: '../../assets/vendors/images/profile.png'
        }
    ];

    // Set default selected project
    useEffect(() => {
        setSelectedProject(projects[0]);
    }, []);

    // Filter projects based on search term
    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.project.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle project selection
    const handleProjectSelect = (project) => {
        setSelectedProject(project);
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
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

    // Handle Aadhar verification
    const handleVerifyAadhar = () => {
        if (formData.aadharNumber.length === 12) {
            alert(`Aadhar verification initiated for: ${formData.aadharNumber}`);
        } else {
            alert('Please enter a valid 12-digit Aadhar number');
        }
    };

    // Handle Light Bill verification
    const handleVerifyLightBill = () => {
        if (formData.lightBillNumber.length === 10) {
            alert(`Light bill verification initiated for: ${formData.lightBillNumber}`);
        } else {
            alert('Please enter a valid 10-digit light bill number');
        }
    };

    // Handle match name button
    const handleMatchName = () => {
        setShowAccountDetails(!showAccountDetails);
    };

    // Handle Aadhar input validation
    const handleAadharInput = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 12);
        setFormData(prev => ({ ...prev, aadharNumber: value }));
    };

    // Handle Light Bill input validation
    const handleLightBillInput = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
        setFormData(prev => ({ ...prev, lightBillNumber: value }));
    };

    // Handle save location
    const handleSaveLocation = () => {
        if (locationSearch) {
            setSummaryAddress(locationSearch);
            setShowLocationModal(false);
        }
    };

    // Handle verify agreement
    const handleVerifyAgreement = () => {
        setActiveTab('interview');
    };

    // Handle confirm signup
    const handleConfirmSignup = () => {
        alert('Project signup confirmed!');
    };

    // Handle apply for loan
    const handleApplyForLoan = () => {
        alert('Redirecting to loan application...');
    };

    // Wizard tabs
    const tabs = [
        { id: 'personal', label: 'KYC' },
        { id: 'job', label: 'Agreement' },
        { id: 'interview', label: 'SignUp' }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="mb-4">
                <nav className="bg-white rounded-lg shadow-sm p-4">
                    <ol className="flex items-center">
                        <li className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900">Project Signup</h3>
                        </li>
                    </ol>
                </nav>
            </div>

            <div className="flex flex-col lg:flex-row">
                {/* Left Sidebar */}
                <div className="lg:w-1/4 p-4">
                    <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
                        <h3 className="text-lg font-bold mb-2">Project Signup</h3>
                        <p className="text-sm text-gray-500 mb-4">Complete the signup process for your solar project</p>

                        {/* Search */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Project List */}
                        <div className="space-y-2 max-h-[500px] overflow-y-auto">
                            {filteredProjects.map((project) => (
                                <button
                                    key={project.id}
                                    onClick={() => handleProjectSelect(project)}
                                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${selectedProject?.id === project.id
                                        ? 'bg-blue-50 border border-blue-300'
                                        : 'hover:bg-gray-50 border border-transparent'
                                        }`}
                                >
                                    <img
                                        src={project.image}
                                        alt={project.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div className="flex-1 text-left ml-3">
                                        <div className="font-semibold text-sm">{project.name}</div>
                                        <div className="text-xs text-gray-500">Project: {project.project}</div>
                                    </div>
                                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                                        {project.panel.split(' ')[0]} {project.panel.split(' ')[1]}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Content */}
                <div className="lg:w-3/4 p-4">
                    <div className="bg-white rounded-lg shadow-sm">
                        {/* Wizard Tabs */}
                        <div className="flex border-b">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${activeTab === tab.id
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* KYC Tab */}
                        {activeTab === 'personal' && selectedProject && (
                            <div className="p-6">
                                {/* Customer Header */}
                                <div className="flex items-center pb-4 mb-4 border-b">
                                    <img
                                        src={selectedProject.image}
                                        alt={selectedProject.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div className="flex-1 ml-3">
                                        <div className="font-semibold">{selectedProject.name}</div>
                                        <div className="text-sm text-gray-500">
                                            <span>{selectedProject.phone}</span><br />
                                            <span>Project: {selectedProject.project} | Consumer: {selectedProject.consumer}</span>
                                        </div>
                                    </div>
                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                                        {selectedProject.panel}
                                    </span>
                                </div>

                                <form>
                                    {/* Aadhar Number */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Aadhar Number
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                id="aadharNumber"
                                                value={formData.aadharNumber}
                                                onChange={handleAadharInput}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Aadhar Number"
                                                maxLength="12"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleVerifyAadhar}
                                                disabled={formData.aadharNumber.length !== 12}
                                                className={`px-4 py-2 rounded-md transition-colors ${formData.aadharNumber.length === 12
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    }`}
                                            >
                                                Verify
                                            </button>
                                        </div>
                                    </div>

                                    {/* Address per Aadhar */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Address per Aadhar
                                        </label>
                                        <div className="border border-gray-300 rounded-md overflow-hidden">
                                            <div className="p-3 border-b border-gray-300">
                                                <div className="text-sm">House No : 12 jkshdbdmnabadh</div>
                                                <div className="text-sm">Street : Narayan nagar street no 8</div>
                                                <div className="text-sm">Landmark : Narayan nagar main road Near kkv chowk</div>
                                                <div className="text-sm">Pincode : 360004</div>
                                            </div>
                                            <div className="p-3">
                                                <div className="text-sm">District : Rajkot</div>
                                                <div className="text-sm">Sub-District : Rajkot City</div>
                                                <div className="text-sm">Village : Mavdi</div>
                                                <div className="text-sm">Post : Mavdi</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Light Bill Consumer Number */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Light Bill Consumer Number
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                id="lightBillNumber"
                                                value={formData.lightBillNumber}
                                                onChange={handleLightBillInput}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Light Bill Consumer Number"
                                                maxLength="10"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleVerifyLightBill}
                                                disabled={formData.lightBillNumber.length !== 10}
                                                className={`px-4 py-2 rounded-md transition-colors ${formData.lightBillNumber.length === 10
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    }`}
                                            >
                                                Verify
                                            </button>
                                        </div>
                                    </div>

                                    {/* Name as Per Aadhar */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Name as Per Aadhar
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                            value={formData.nameAsPerAadhar}
                                            readOnly
                                        />
                                    </div>

                                    {/* Name as Per Electricity Bill */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Name as Per Electricity Bill
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                            value={formData.nameAsPerBill}
                                            readOnly
                                        />
                                    </div>

                                    {/* Match Name Button */}
                                    <div className="mb-4">
                                        <button
                                            type="button"
                                            onClick={handleMatchName}
                                            className={`px-4 py-2 rounded-md transition-colors ${showAccountDetails
                                                ? 'bg-green-600 text-white hover:bg-green-700'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                                }`}
                                        >
                                            {showAccountDetails ? 'Names Matched!' : 'Match Name'}
                                        </button>
                                    </div>

                                    {/* Account Details */}
                                    {showAccountDetails && (
                                        <div className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                                            <h6 className="font-semibold mb-3">Bank Account Details</h6>

                                            {/* Bank Account Number */}
                                            <div className="mb-3">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Bank Account Number
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Bank Account Number"
                                                    value={formData.bankAccount}
                                                    onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                                                />
                                            </div>

                                            {/* IFSC Code */}
                                            <div className="mb-3">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    IFSC Code
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="IFSC Code"
                                                    value={formData.ifscCode}
                                                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                                                />
                                            </div>

                                            {/* Bank Account Holder Name */}
                                            <div className="mb-3">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Bank Account Holder Name
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Bank Account Holder Name"
                                                    value={formData.accountHolderName}
                                                    onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                                                />
                                            </div>

                                            {/* Match Name Button */}
                                            <button
                                                type="button"
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                            >
                                                Match Name
                                            </button>
                                        </div>
                                    )}

                                    {/* KYC Documents Section */}
                                    <h6 className="font-semibold mb-1">KYC Documents</h6>
                                    <p className="text-sm text-gray-500 mb-3">Please upload all required documents for verification</p>

                                    {/* Customer Photo */}
                                    <div className="mb-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Customer Photo
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="file"
                                                onChange={(e) => handleFileUpload(e, 'customerPhoto')}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                                            />
                                            {uploadedFiles.customerPhoto && (
                                                <Camera size={20} className="text-green-600" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Electricity Bill */}
                                    <div className="mb-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Electricity Bill
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="file"
                                                onChange={(e) => handleFileUpload(e, 'electricityBill')}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                                            />
                                            <button
                                                type="button"
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                            >
                                                Verify
                                            </button>
                                        </div>
                                        <small className="text-xs text-gray-500 italic">
                                            *Note: Your Property Document & Electricity Bill Name Must Be Same.
                                        </small>
                                    </div>

                                    {/* Cancel Cheque */}
                                    <div className="mb-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Cancel Cheque
                                        </label>
                                        <input
                                            type="file"
                                            onChange={(e) => handleFileUpload(e, 'cancelCheque')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        />
                                    </div>

                                    {/* Upload Document */}
                                    <div className="mb-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Upload Document
                                        </label>
                                        <input
                                            type="file"
                                            onChange={(e) => handleFileUpload(e, 'uploadDocument')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        />
                                    </div>
                                </form>

                                {/* Navigation */}
                                <div className="flex justify-between mt-6">
                                    <button
                                        type="button"
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md cursor-not-allowed opacity-50"
                                        disabled
                                    >
                                        Previous
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('job')}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                                    >
                                        Next <ChevronRight size={16} className="ml-1" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Agreement Tab */}
                        {activeTab === 'job' && (
                            <div className="p-6">
                                <div className="mb-4">
                                    <img
                                        src="https://view.publitas.com/21316/962101/pages/6e07b7881110780718828092daee14963feddad6-at1600.jpg"
                                        alt="Agreement Document"
                                        className="w-full max-h-96 object-contain border border-gray-300 rounded-md mb-4"
                                    />

                                    <div className="flex items-center mb-4">
                                        <input
                                            type="checkbox"
                                            id="agree-terms"
                                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                            defaultChecked
                                        />
                                        <label htmlFor="agree-terms" className="ml-2 text-sm text-gray-700">
                                            I Agree to the terms and conditions
                                        </label>
                                    </div>

                                    <button
                                        onClick={handleVerifyAgreement}
                                        className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mb-4"
                                    >
                                        Verify Agreement by OTP
                                    </button>

                                    <hr className="my-4" />

                                    <button
                                        onClick={() => setShowLocationModal(true)}
                                        className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
                                    >
                                        <MapPin size={18} className="mr-2" />
                                        Choose Location
                                    </button>
                                </div>

                                {/* Navigation */}
                                <div className="flex justify-between mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('personal')}
                                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center"
                                    >
                                        <ChevronLeft size={16} className="mr-1" /> Previous
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('interview')}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                                    >
                                        Next <ChevronRight size={16} className="ml-1" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* SignUp Tab */}
                        {activeTab === 'interview' && (
                            <div className="p-6">
                                {/* KYC Summary */}
                                <div className="border-l-4 border-orange-500 pl-4 mb-4">
                                    <div className="flex items-center mb-2">
                                        <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs mr-2">
                                            1
                                        </div>
                                        <h3 className="text-lg font-semibold">KYC</h3>
                                    </div>
                                    <p className="mb-1"><strong>Aadhar Number:</strong> {formData.aadharNumber}</p>
                                    <p className="mb-2"><strong>Consumer Number:</strong> DB7784454MM</p>
                                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                                        Edit
                                    </button>
                                </div>

                                {/* Agreement Summary */}
                                <div className="border-l-4 border-orange-500 pl-4 mb-4">
                                    <div className="flex items-center mb-2">
                                        <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs mr-2">
                                            2
                                        </div>
                                        <h3 className="text-lg font-semibold">Agreement</h3>
                                    </div>
                                    <p className="mb-2"><strong>Customer Agreement</strong></p>
                                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                                        View
                                    </button>
                                </div>

                                {/* Location Summary */}
                                <div className="border-l-4 border-orange-500 pl-4 mb-4">
                                    <div className="flex items-center mb-2">
                                        <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs mr-2">
                                            3
                                        </div>
                                        <h3 className="text-lg font-semibold">Location</h3>
                                    </div>
                                    <p className="mb-2"><strong>Address:</strong> {summaryAddress}</p>
                                    <button
                                        onClick={() => setShowLocationModal(true)}
                                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                                    >
                                        Edit
                                    </button>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={handleConfirmSignup}
                                        className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Confirm Project Signup
                                    </button>
                                    <button
                                        onClick={handleApplyForLoan}
                                        className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Apply For Loan
                                    </button>
                                </div>

                                {/* Navigation */}
                                <div className="flex justify-between mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('job')}
                                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center"
                                    >
                                        <ChevronLeft size={16} className="mr-1" /> Previous
                                    </button>
                                    <button
                                        type="button"
                                        className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed opacity-50"
                                        disabled
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Location Modal */}
            {showLocationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
                        <div className="px-6 py-4 border-b flex justify-between items-center">
                            <h4 className="text-lg font-semibold">Select Location</h4>
                            <button
                                onClick={() => setShowLocationModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-4">
                                <label htmlFor="location-search" className="block text-sm font-medium text-gray-700 mb-1">
                                    Search Location
                                </label>
                                <input
                                    type="text"
                                    id="location-search"
                                    value={locationSearch}
                                    onChange={(e) => setLocationSearch(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter address"
                                />
                            </div>

                            <div className="w-full h-96">
                                <iframe
                                    width="100%"
                                    height="400"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    allowFullScreen
                                    referrerPolicy="no-referrer-when-downgrade"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1502323.1349301514!2d70.439774!3d22.0698851!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3959ca733392c0ed%3A0x9d0f6f0dcc6020c2!2sRajkot%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1713330000000"
                                    title="Location Map"
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t flex justify-end space-x-3">
                            <button
                                onClick={() => setShowLocationModal(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleSaveLocation}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Save changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FranchiseProjectSignup;