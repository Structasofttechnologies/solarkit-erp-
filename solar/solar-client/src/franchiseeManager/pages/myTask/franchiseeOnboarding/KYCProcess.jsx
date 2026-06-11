import React, { useState, useRef } from 'react';
import {
    Upload,
    Download,
    Eye,
    CheckCircle,
    ArrowRightCircle,
    FileText,
    CreditCard,
    Banknote,
    Calendar,
    Hash,
    Image,
    Check,
    X,
    AlertCircle,
    ChevronRight,
    Shield,
    FileSignature,
    DollarSign,
    Building,
    Phone,
    User,
    Globe,
    Clock,
    Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

const FranchiseeManagerKYCProcess = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [verificationComplete, setVerificationComplete] = useState(false);
    const audioRef = useRef(null);

    // Form state for KYC documents
    const [kycDocs, setKycDocs] = useState({
        aadharFront: null,
        aadharBack: null,
        aadharNumber: '',
        panCard: null,
        panNumber: '',
        gst: null,
        gstNumber: '',
        udhyog: null,
        udhyogNumber: '',
        documentType: '',
        attachment: null,
        remark: ''
    });

    // Agreement state
    const [agreement, setAgreement] = useState({
        type: '',
        remark: '',
        validity: ''
    });

    // Payment state
    const [payment, setPayment] = useState({
        showApp: false,
        paymentMode: '',
        requiredFees: '',
        referenceNo: '',
        date: '',
        amount: '',
        attachment: null,
        bankName: '',
        accountNo: '',
        ifscCode: '',
        securityAmount: '',
        chequeNo: '',
        chequePhoto: null,
        status: ''
    });

    const handleFileChange = (field, e) => {
        const file = e.target.files[0];
        setKycDocs(prev => ({ ...prev, [field]: file }));
    };

    const handlePaymentFileChange = (field, e) => {
        const file = e.target.files[0];
        setPayment(prev => ({ ...prev, [field]: file }));
    };

    const handleVerify = (type) => {
        console.log(`Verifying ${type}...`);
        // Add verification logic here
    };

    const handleCompleteVerification = () => {
        // Play sound
        if (audioRef.current) {
            audioRef.current.play().catch(e => console.log("Audio playback error:", e));
        }

        // Launch confetti
        confetti({
            particleCount: 200,
            spread: 120,
            origin: { y: 0.6 }
        });

        setVerificationComplete(true);
    };

    const tabs = [
        { id: 0, name: 'KYC', icon: Shield },
        { id: 1, name: 'Agreement', icon: FileSignature },
        { id: 2, name: 'CP Payment', icon: DollarSign }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6">
                {/* Audio element for fanfare */}
                <audio
                    ref={audioRef}
                    src="/assets/sounds/trumpet-fanfare-ceremonial-announcement.mp3"
                    preload="auto"
                />

                {/* Header */}
                <div className="mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <h4 className="text-xl font-semibold text-blue-600 flex items-center">
                            <Shield className="mr-2" size={24} />
                            Franchisee KYC & Onboarding Process
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">Complete KYC verification and agreement signing</p>
                    </div>
                </div>

                {/* Progress Tabs */}
                <div className="bg-white rounded-xl shadow-sm mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            {tabs.map((tab, index) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(index)}
                                        className={`group inline-flex items-center px-6 py-4 border-b-2 font-medium text-sm transition-colors ${activeTab === index
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <Icon size={18} className={`mr-2 ${activeTab === index ? 'text-blue-500' : 'text-gray-400'
                                            }`} />
                                        {tab.name}
                                        {index < tabs.length - 1 && (
                                            <ChevronRight size={16} className="ml-2 text-gray-300" />
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    {/* KYC Tab */}
                    {activeTab === 0 && (
                        <div className="space-y-6">
                            <h5 className="text-lg font-semibold text-primary mb-4">KYC Documents</h5>

                            {/* Aadhar Card Section */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Aadhar Card Front:
                                    </label>
                                    <input
                                        type="file"
                                        onChange={(e) => handleFileChange('aadharFront', e)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Aadhar Card Back:
                                    </label>
                                    <input
                                        type="file"
                                        onChange={(e) => handleFileChange('aadharBack', e)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Aadhar Card Number:
                                    </label>
                                    <input
                                        type="number"
                                        value={kycDocs.aadharNumber}
                                        onChange={(e) => setKycDocs(prev => ({ ...prev, aadharNumber: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={() => handleVerify('aadhar')}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                    >
                                        Verify
                                    </button>
                                </div>
                            </div>

                            {/* Pan Card Section */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Pan Card:
                                    </label>
                                    <input
                                        type="file"
                                        onChange={(e) => handleFileChange('panCard', e)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Pan Card Number:
                                    </label>
                                    <input
                                        type="text"
                                        value={kycDocs.panNumber}
                                        onChange={(e) => setKycDocs(prev => ({ ...prev, panNumber: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div></div>
                                <div className="flex items-end">
                                    <button
                                        onClick={() => handleVerify('pan')}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                    >
                                        Verify
                                    </button>
                                </div>
                            </div>

                            {/* GST Section */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        GST:
                                    </label>
                                    <input
                                        type="file"
                                        onChange={(e) => handleFileChange('gst', e)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        GST Number:
                                    </label>
                                    <input
                                        type="text"
                                        value={kycDocs.gstNumber}
                                        onChange={(e) => setKycDocs(prev => ({ ...prev, gstNumber: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div></div>
                                <div className="flex items-end">
                                    <button
                                        onClick={() => handleVerify('gst')}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                    >
                                        Verify
                                    </button>
                                </div>
                            </div>

                            {/* Udhyog Aadhar Section */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Udhyog Aadhar:
                                    </label>
                                    <input
                                        type="file"
                                        onChange={(e) => handleFileChange('udhyog', e)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Udhyog Aadhar Number:
                                    </label>
                                    <input
                                        type="text"
                                        value={kycDocs.udhyogNumber}
                                        onChange={(e) => setKycDocs(prev => ({ ...prev, udhyogNumber: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div></div>
                                <div className="flex items-end">
                                    <button
                                        onClick={() => handleVerify('udhyog')}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                    >
                                        Verify
                                    </button>
                                </div>
                            </div>

                            {/* Additional Documents */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Document Type:
                                    </label>
                                    <select
                                        value={kycDocs.documentType}
                                        onChange={(e) => setKycDocs(prev => ({ ...prev, documentType: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Document Type</option>
                                        <option value="payment">Payment Attachment</option>
                                        <option value="cheque">Payment Cheque</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Attachment:
                                    </label>
                                    <input
                                        type="file"
                                        onChange={(e) => handleFileChange('attachment', e)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Remark
                                    </label>
                                    <input
                                        type="text"
                                        value={kycDocs.remark}
                                        onChange={(e) => setKycDocs(prev => ({ ...prev, remark: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={() => handleVerify('additional')}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                    >
                                        Verify
                                    </button>
                                </div>
                            </div>

                            {/* Documents Table */}
                            <div className="mt-8">
                                <h6 className="font-semibold mb-3">Uploaded Documents</h6>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-[#0f4e8d]">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-white">No.</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-white">Document Type</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-white">Document No.</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-white">Person Name</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-white">Attachment</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-white">Remark</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-white">Created date</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-white">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            <tr>
                                                <td colSpan="8" className="px-4 py-4 text-center text-red-500 font-semibold">
                                                    No Data Found
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Agreement Tab */}
                    {activeTab === 1 && (
                        <div className="space-y-6">
                            <h5 className="text-lg font-semibold text-primary mb-4">Agreement</h5>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Agreement Type:
                                    </label>
                                    <select
                                        value={agreement.type}
                                        onChange={(e) => setAgreement(prev => ({ ...prev, type: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Agreement Type</option>
                                        <option value="enterprise">Enterprise</option>
                                        <option value="solar">Solar Business</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Remark
                                    </label>
                                    <input
                                        type="text"
                                        value={agreement.remark}
                                        onChange={(e) => setAgreement(prev => ({ ...prev, remark: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Validity
                                    </label>
                                    <input
                                        type="date"
                                        value={agreement.validity}
                                        onChange={(e) => setAgreement(prev => ({ ...prev, validity: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={() => handleVerify('agreement')}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                    >
                                        Verify
                                    </button>
                                </div>
                            </div>

                            {/* Agreement Table */}
                            <div className="mt-8">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-[#0f4e8d]">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-white">Agreement</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-white">Agreement Type</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-white">Agreement Download</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-white">Status</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-white">Remark</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-white">Created date</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-white">Validity date</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-white">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            <tr>
                                                <td className="px-4 py-2 text-xs">RJT/24-25/007</td>
                                                <td className="px-4 py-2 text-xs">CP Agreement</td>
                                                <td className="px-4 py-2 text-center">
                                                    <button className="text-blue-600 hover:text-blue-800 mr-2">
                                                        <Download size={16} />
                                                    </button>
                                                    <button className="text-blue-600 hover:text-blue-800">
                                                        <Eye size={16} />
                                                    </button>
                                                </td>
                                                <td className="px-4 py-2 text-xs">
                                                    <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded-full">
                                                        Ready sign
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-xs"></td>
                                                <td className="px-4 py-2 text-xs">11-03-2025 10:59 am</td>
                                                <td className="px-4 py-2 text-xs">11-03-2026</td>
                                                <td className="px-4 py-2 text-xs"></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CP Payment Tab */}
                    {activeTab === 2 && (
                        <div className="space-y-6">
                            <h5 className="text-lg font-semibold text-blue-600 flex items-center mb-4">
                                <ArrowRightCircle size={20} className="mr-2" />
                                CP Payment
                            </h5>

                            {/* Signup Fees Setting */}
                            <div>
                                <h6 className="font-semibold mb-3">Signup Fees Setting</h6>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex items-center">
                                        <label className="text-sm font-medium text-gray-700 mr-3">
                                            Show App or Not:
                                        </label>
                                        <input
                                            type="checkbox"
                                            checked={payment.showApp}
                                            onChange={(e) => setPayment(prev => ({ ...prev, showApp: e.target.checked }))}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Payment Mode
                                        </label>
                                        <select
                                            value={payment.paymentMode}
                                            onChange={(e) => setPayment(prev => ({ ...prev, paymentMode: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select Payment Mode</option>
                                            <option value="cpFees">Channel Partner Fees</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Required Fees
                                        </label>
                                        <input
                                            type="text"
                                            value={payment.requiredFees}
                                            onChange={(e) => setPayment(prev => ({ ...prev, requiredFees: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Signup Fees Details */}
                            <div>
                                <h6 className="font-semibold mb-3">Signup Fees Details</h6>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Reference No:
                                        </label>
                                        <input
                                            type="text"
                                            value={payment.referenceNo}
                                            onChange={(e) => setPayment(prev => ({ ...prev, referenceNo: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Date
                                        </label>
                                        <input
                                            type="date"
                                            value={payment.date}
                                            onChange={(e) => setPayment(prev => ({ ...prev, date: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Amount
                                        </label>
                                        <input
                                            type="text"
                                            value={payment.amount}
                                            onChange={(e) => setPayment(prev => ({ ...prev, amount: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Attachment
                                        </label>
                                        <input
                                            type="file"
                                            onChange={(e) => handlePaymentFileChange('attachment', e)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Security Deposit */}
                            <div>
                                <h6 className="font-semibold mb-3">Security Deposit</h6>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Bank Name:
                                        </label>
                                        <input
                                            type="text"
                                            value={payment.bankName}
                                            onChange={(e) => setPayment(prev => ({ ...prev, bankName: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Bank Account No.
                                        </label>
                                        <input
                                            type="number"
                                            value={payment.accountNo}
                                            onChange={(e) => setPayment(prev => ({ ...prev, accountNo: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            IFSC Code
                                        </label>
                                        <input
                                            type="text"
                                            value={payment.ifscCode}
                                            onChange={(e) => setPayment(prev => ({ ...prev, ifscCode: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Amount
                                        </label>
                                        <input
                                            type="number"
                                            value={payment.securityAmount}
                                            onChange={(e) => setPayment(prev => ({ ...prev, securityAmount: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Cheque No:
                                        </label>
                                        <input
                                            type="text"
                                            value={payment.chequeNo}
                                            onChange={(e) => setPayment(prev => ({ ...prev, chequeNo: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Cheque Photo
                                        </label>
                                        <input
                                            type="file"
                                            onChange={(e) => handlePaymentFileChange('chequePhoto', e)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            value={payment.status}
                                            onChange={(e) => setPayment(prev => ({ ...prev, status: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select Status</option>
                                            <option value="unverified">Unverified</option>
                                            <option value="verified">Verified</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Complete Verification Button */}
                            <div className="mt-8 flex justify-center">
                                <button
                                    onClick={handleCompleteVerification}
                                    disabled={verificationComplete}
                                    className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 flex items-center ${verificationComplete
                                            ? 'bg-blue-600 text-white cursor-not-allowed'
                                            : 'bg-green-500 text-white hover:bg-green-600'
                                        }`}
                                >
                                    {verificationComplete ? (
                                        <>
                                            <CheckCircle size={24} className="mr-2" />
                                            🎉 Verification Completed!
                                        </>
                                    ) : (
                                        <>
                                            <Award size={24} className="mr-2" />
                                            Complete Verification
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FranchiseeManagerKYCProcess;