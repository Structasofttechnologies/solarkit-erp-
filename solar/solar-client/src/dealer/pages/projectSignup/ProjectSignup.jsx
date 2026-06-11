import React, { useState, useEffect } from 'react';
import {
    Search,
    User,
    Phone,
    FileText,
    MapPin,
    CheckCircle,
    X,
    ChevronRight,
    ChevronLeft,
    Award,
    Home,
    CreditCard,
    Upload,
    Eye,
    Edit,
    Map,
    Share2,
    AlertCircle,
    Lock,
    Unlock,
    Calendar,
    Loader
} from 'lucide-react';
import { locationAPI, leadAPI, projectAPI } from '../../../api/api';

const DealerProjectSignup = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLead, setSelectedLead] = useState(null);
    const [activeTab, setActiveTab] = useState('kyc');
    const [showLocationModal, setShowLocationModal] = useState(false);

    // Form states
    const [aadharNumber, setAadharNumber] = useState('');
    const [lightBillNumber, setLightBillNumber] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [locationAddress, setLocationAddress] = useState('');

    // Agreement checkbox
    const [agreeTerms, setAgreeTerms] = useState(false);


    // Fetch leads
    const fetchLeads = async () => {
        setLoading(true);
        try {
            const params = {
                search: searchTerm,
                status: 'QuoteGenerated' // Signup shows leads that have quote generated
            };
            const response = await leadAPI.getAllLeads(params);
            if (response.data && response.data.data) {
                setLeads(response.data.data);
                if (response.data.data.length > 0 && !selectedLead) {
                    setSelectedLead(response.data.data[0]);
                }
            }
        } catch (error) {
            console.error("Error fetching leads:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchLeads();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    useEffect(() => {
        if (selectedLead) {
            setWhatsappNumber(selectedLead.whatsapp || selectedLead.mobile || '');
            setLocationAddress(`${selectedLead.district?.name || ''}, ${selectedLead.city?.name || ''}`);
        }
    }, [selectedLead]);


    // Handle Aadhar verification
    const handleVerifyAadhar = () => {
        if (aadharNumber.length === 12) {
            alert('Aadhar verification initiated for: ' + aadharNumber);
        } else {
            alert('Please enter a valid 12-digit Aadhar number');
        }
    };

    // Handle Light Bill verification
    const handleVerifyLightBill = () => {
        if (lightBillNumber.length > 5) {
            alert('Light bill verification initiated for: ' + lightBillNumber);
        } else {
            alert('Please enter a valid light bill number');
        }
    };

    const handleSignupComplete = async () => {
        if (!selectedLead) return;
        if (!agreeTerms) {
            alert("Please agree to the terms and conditions.");
            return;
        }

        try {
            // First update lead details if needed (aadhar, etc) - or send them to signProject if needed
            // The current backend signProject doesn't take body params for aadhar/lightbill, 
            // but we should probably save them to Lead first or create Project with them.
            // Let's update Lead first then Sign Project.

            await leadAPI.updateLead(selectedLead._id, {
                aadharNumber,
                lightBillNumber,
                // status: 'ProjectSigned' // Let signProject handle the status change
            });

            // Call Sign Project API
            await projectAPI.signProject(selectedLead._id);

            alert("Project Signed Up Successfully! Project Created.");
            setSelectedLead(null);
            fetchLeads(); // Refresh
        } catch (error) {
            console.error("Error signing up project:", error);
            alert("Failed to sign up project. " + (error.response?.data?.message || error.message));
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <div className="bg-white shadow-sm z-10">
                <div className="container-fluid px-6 py-4 flex justify-between items-center relative">
                    <h2 className="text-xl font-bold text-gray-800 tracking-tight">Project Signup</h2>

                    {/* Top Steps Nav Indicator */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-12">
                        <span
                            onClick={() => setActiveTab('kyc')}
                            className={`font-semibold text-sm cursor-pointer pb-1 ${activeTab === 'kyc' ? 'text-[#0ea5e9] border-b-2 border-[#0ea5e9]' : 'text-gray-400 border-b-2 border-transparent hover:text-gray-600'}`}>
                            KYC
                        </span>
                        <span
                            onClick={() => setActiveTab('agreement')}
                            className={`font-semibold text-sm cursor-pointer pb-1 ${activeTab === 'agreement' ? 'text-[#0ea5e9] border-b-2 border-[#0ea5e9]' : 'text-gray-400 border-b-2 border-transparent hover:text-gray-600'}`}>
                            Agreement
                        </span>
                        <span
                            onClick={() => setActiveTab('signup')}
                            className={`font-semibold text-sm cursor-pointer pb-1 ${activeTab === 'signup' ? 'text-[#0ea5e9] border-b-2 border-[#0ea5e9]' : 'text-gray-400 border-b-2 border-transparent hover:text-gray-600'}`}>
                            SignUp
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* LEFT SIDE - List (30%) */}
                <div className="w-[30%] bg-gray-50 flex flex-col z-0 p-6 border-r border-gray-200">
                    <div className="bg-white rounded-sm shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 text-sm tracking-wide">Project Signup</h3>
                            <p className="text-xs text-gray-500 mb-3">Complete the signup process for your solar project</p>
                            <input
                                type="text"
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-[#0ea5e9]"
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
                            {loading ? (
                                <div className="flex justify-center items-center py-10">
                                    <Loader className="animate-spin text-[#0ea5e9]" size={24} />
                                </div>
                            ) : leads.length === 0 ? (
                                <div className="text-center text-gray-500 py-10 px-4">
                                    <p className="text-sm">No projects pending signup.</p>
                                </div>
                            ) : (
                                leads.map((lead) => (
                                    <div
                                        key={lead._id}
                                        onClick={() => setSelectedLead(lead)}
                                        className={`p-3 rounded-sm cursor-pointer transition-colors flex items-center shadow-sm border ${selectedLead && selectedLead._id === lead._id ? 'bg-[#0ea5e9] border-[#0ea5e9] text-white' : 'bg-white border-gray-200 hover:border-[#0ea5e9] text-gray-700'}`}
                                    >
                                        <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shrink-0 mr-3 overflow-hidden shadow-xs border border-gray-100">
                                            <img src={`https://ui-avatars.com/api/?name=${lead.name.replace(' ', '+')}&background=random`} alt="Avatar" className="h-full w-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`text-sm font-semibold truncate ${selectedLead && selectedLead._id === lead._id ? 'text-white' : 'text-gray-800'}`}>{lead.name}</h4>
                                            <div className={`text-[10px] truncate ${selectedLead && selectedLead._id === lead._id ? 'text-blue-100' : 'text-gray-500'}`}>
                                                Project: PRJ-{lead._id.substring(lead._id.length - 3)}
                                            </div>
                                        </div>
                                        <div className="shrink-0 ml-2">
                                            <span className={`text-[10px] px-2 py-1 rounded-sm font-medium ${selectedLead && selectedLead._id === lead._id ? 'bg-blue-600/50 text-white border border-blue-400' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                                8 Panel
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE - Details (70%) */}
                <div className="w-[70%] flex flex-col bg-gray-50 overflow-y-auto p-6">
                    {selectedLead ? (
                        <div className="bg-white rounded-sm shadow-sm border border-gray-200 w-full max-w-5xl mx-auto flex flex-col">
                            {/* Inner Header Profile Strip */}
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-sm">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mr-3 border border-gray-200 overflow-hidden">
                                        <img src={`https://ui-avatars.com/api/?name=${selectedLead.name.replace(' ', '+')}&background=random`} alt="Avatar" className="h-full w-full object-cover" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-gray-800">{selectedLead.name}</h2>
                                        <div className="text-xs text-gray-600 mt-0.5">
                                            +91 {selectedLead.mobile}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5 font-medium">
                                            Project: PRJ-{selectedLead._id.substring(selectedLead._id.length - 3)} | Consumer: CN-001
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-semibold text-gray-700">8 Panel ({selectedLead.kw} KW)</div>
                                </div>
                            </div>

                            {/* Main Scrollable Form Area */}
                            <div className="p-6 overflow-y-auto flex-1 bg-white">
                                {activeTab === 'kyc' && (
                                    <div className="space-y-6 max-w-4xl">

                                        {/* Aadhar Block */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-800 mb-2">Aadhar Number</label>
                                            <div className="flex items-stretch shadow-sm border border-[#0ea5e9] rounded-sm overflow-hidden">
                                                <input
                                                    type="text"
                                                    value={aadharNumber}
                                                    onChange={(e) => setAadharNumber(e.target.value)}
                                                    className="flex-1 p-2 text-sm focus:outline-none"
                                                    placeholder="123456789012"
                                                />
                                                <button
                                                    onClick={handleVerifyAadhar}
                                                    className="bg-[#0ea5e9] text-white px-6 text-sm font-semibold hover:bg-blue-600 transition-colors"
                                                >
                                                    Verify
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-800 mb-2">Address per Aadhar</label>
                                            <div className="bg-gray-50 border border-gray-200 p-4 rounded-sm text-xs text-gray-700 grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <div><span className="font-semibold">House No :</span> 12 jashdodnmbhadh</div>
                                                    <div><span className="font-semibold">Street :</span> Narayan nagar street no 5</div>
                                                    <div><span className="font-semibold">Landmark :</span> Narayan nagar main road Near kkv chowk</div>
                                                    <div><span className="font-semibold">Pincode :</span> 360004</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div><span className="font-semibold">District :</span> {selectedLead.district?.name || 'Rajkot'}</div>
                                                    <div><span className="font-semibold">Sub-District :</span> {selectedLead.city?.name || 'Rajkot City'}</div>
                                                    <div><span className="font-semibold">Village :</span> Mavdi</div>
                                                    <div><span className="font-semibold">Post :</span> Mavdi</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Light Bill Block */}
                                        <div className="pt-2">
                                            <label className="block text-xs font-bold text-gray-800 mb-2">Light Bill Consumer Number</label>
                                            <div className="flex items-stretch shadow-sm border border-[#0ea5e9] rounded-sm overflow-hidden">
                                                <input
                                                    type="text"
                                                    value={lightBillNumber}
                                                    onChange={(e) => setLightBillNumber(e.target.value)}
                                                    className="flex-1 p-2 text-sm focus:outline-none"
                                                    placeholder="1234567890"
                                                />
                                                <button
                                                    onClick={handleVerifyLightBill}
                                                    className="bg-[#0ea5e9] text-white px-6 text-sm font-semibold hover:bg-blue-600 transition-colors"
                                                >
                                                    Verify
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-2">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-800 mb-2">Name as Per Aadhar</label>
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value="Sunil Pipatar"
                                                    className="w-full bg-gray-100 border border-gray-200 rounded-sm p-2 text-sm text-gray-800 cursor-not-allowed outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-800 mb-2">Name as Per Electricity Bill</label>
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value="Sunil Pipatar"
                                                    className="w-full bg-gray-100 border border-gray-200 rounded-sm p-2 text-sm text-gray-800 cursor-not-allowed outline-none"
                                                />
                                            </div>
                                            <button className="bg-[#0ea5e9] text-white text-xs font-semibold px-4 py-2 rounded-sm shadow-sm hover:bg-blue-600 transition-colors">
                                                Match Name
                                            </button>
                                        </div>

                                        {/* KYC Documents Block */}
                                        <div className="pt-8 border-t border-gray-100">
                                            <h3 className="text-sm font-bold text-gray-800 mb-1">KYC Documents</h3>
                                            <p className="text-xs text-gray-400 mb-6">Please upload all required documents for verification</p>

                                            <div className="space-y-5">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-800 mb-2">Customer Photo</label>
                                                    <div className="border border-gray-300 rounded-sm bg-white flex items-center p-1 w-full max-w-md">
                                                        <input type="file" className="text-xs text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer" />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-gray-800 mb-2">Electricity Bill</label>
                                                    <div className="flex items-center max-w-lg space-x-2">
                                                        <div className="border border-gray-300 rounded-sm bg-white flex items-center p-1 w-full max-w-md">
                                                            <input type="file" className="text-xs text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer" />
                                                        </div>
                                                        <button className="bg-[#0ea5e9] text-white text-xs font-semibold px-4 py-1.5 rounded-sm shadow-sm hover:bg-blue-600 transition-colors shrink-0">
                                                            Verify
                                                        </button>
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 mt-1 italic">*Note: Your Property Consumer & Electricity Bill Master Must Be Same.</p>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-gray-800 mb-2">Cancel Cheque</label>
                                                    <div className="border border-gray-300 rounded-sm bg-white flex items-center p-1 w-full max-w-md">
                                                        <input type="file" className="text-xs text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer" />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-gray-800 mb-2">Upload Document</label>
                                                    <div className="border border-gray-300 rounded-sm bg-white flex items-center p-1 w-full max-w-md">
                                                        <input type="file" className="text-xs text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                )}

                                {activeTab === 'kyc' && (
                                    <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-between items-center rounded-b-sm shrink-0">
                                        <button className="bg-gray-500 hover:bg-gray-600 text-white text-xs font-semibold px-6 py-2 rounded-sm shadow-sm transition-colors opacity-0 pointer-events-none">
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('agreement')}
                                            className="bg-[#0f172a] hover:bg-black text-white text-xs font-semibold px-6 py-2 rounded-full shadow-sm flex items-center transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}

                                {/* AGREEMENT TAB */}
                                {activeTab === 'agreement' && (
                                    <div className="flex flex-col h-full space-y-6">

                                        {/* A4 Document Placeholder Wrapper */}
                                        <div className="flex justify-center bg-gray-50 p-6 rounded-sm border border-gray-200 shadow-inner flex-1 overflow-y-auto w-full">
                                            {/* Dummy A4 Paper */}
                                            <div className="bg-white shadow-md border border-gray-300 aspect-[1/1.414] w-[400px] p-8 flex flex-col relative text-center flex-shrink-0">
                                                <div className="flex justify-center mb-4"><div className="w-10 flex space-x-1"><div className="flex-1 bg-blue-800 h-6"></div><div className="flex-1 bg-white h-6"></div><div className="flex-1 bg-red-600 h-6"></div></div></div>
                                                <h3 className="text-[10px] font-bold text-gray-800 tracking-widest text-center mt-2">CERTIFICAT D'AGRÉMENT</h3>
                                                <p className="text-[6px] text-gray-500 mt-1 uppercase">D'ORGANISME DE MAINTENANCE</p>
                                                <div className="text-[5px] text-gray-400 mt-2 mb-4 border-b pb-2">Reference : FR.145.0116</div>

                                                <div className="space-y-2 text-[5px] text-gray-600 text-justify flex-1">
                                                    <p>Conformément au règlement (CE) n°216/2008 du Parlement européen et du Conseil et au règlement (CE) n°2042/2003 de la Commission pour le temps étant en vigueur et sous réserve des conditions précisées ci-dessous, la Direction Générale de l'Aviation Civile, agissant comme autorité compétente de l'Etat Membre, certifie par la présente :</p>
                                                    <div className="font-bold text-[7px] text-center my-3 uppercase">FACTEM<br /><span className="font-normal text-[5px]">ZI, Route de Caen - 14610 THAON</span></div>
                                                    <p>Comme organisme de maintenance agréé en accord avec la Partie-145, section A, habilité à entretenir les produits, pièces et équipements listés dans le domaine de portée d'agrément joint et à délivrer les certificats d'approbation pour remise en service correspondants en utilisant les références ci-dessus.</p>

                                                    <div className="font-bold text-left mt-4 mb-2">CONDITIONS :</div>
                                                    <ol className="list-decimal pl-4 space-y-1 text-left">
                                                        <li>Cet agrément est limité au domaine précisé dans la section portée de l'agrément du manuel de l'organisme de maintenance approuvé suivant les exigences de la Partie-145 de l'Annexe II, et</li>
                                                        <li>Cet agrément nécessite la conformité aux procédures indiquées dans le manuel de l'organisme de maintenance approuvé par la Partie-145, et</li>
                                                        <li>Cet agrément est valide tant que l'organisme de maintenance approuvé reste en conformité avec la Partie-145 de l'Annexe II.</li>
                                                    </ol>
                                                </div>

                                                <div className="flex justify-between items-end mt-4 mb-2">
                                                    <div className="text-[5px] text-left">Date de la délivrance initiale : 11/12/2014<br />Date de la révision actuelle : <br />N° de Révision : 0</div>
                                                    <div className="text-[5px] text-center border-t border-black pt-1 px-4">Signature<br />Hugues Gombe</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center mt-4">
                                            <input
                                                id="terms"
                                                type="checkbox"
                                                checked={agreeTerms}
                                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded-sm"
                                            />
                                            <label htmlFor="terms" className="ml-2 font-semibold text-sm text-gray-800">
                                                I Agree to the terms and conditions
                                            </label>
                                        </div>

                                        <div className="flex flex-col items-start space-y-4 pt-2 pb-6 w-full">
                                            <button className="bg-[#0ea5e9] text-white text-xs font-semibold px-4 py-2.5 rounded-sm hover:bg-blue-600 transition-colors shadow-sm">
                                                Verify Agreement by OTP
                                            </button>
                                            <button
                                                onClick={() => setShowLocationModal(true)}
                                                className="bg-[#0ea5e9] text-white text-xs font-semibold px-6 py-2.5 rounded-sm hover:bg-blue-600 transition-colors shadow-sm">
                                                Choose Location
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'agreement' && (
                                    <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-between items-center rounded-b-sm shrink-0 w-full">
                                        <button
                                            onClick={() => setActiveTab('kyc')}
                                            className="bg-gray-500 hover:bg-gray-600 text-white text-xs font-semibold px-6 py-2 rounded-sm shadow-sm transition-colors">
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (!agreeTerms) {
                                                    alert("Please agree to the terms.");
                                                    return;
                                                }
                                                setActiveTab('signup');
                                            }}
                                            className={`text-white text-xs font-semibold px-6 py-2 rounded-full shadow-sm flex items-center transition-colors ${agreeTerms ? 'bg-[#0f172a] hover:bg-black' : 'bg-gray-300 cursor-not-allowed'}`}
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}

                                {/* SIGNUP TAB */}
                                {activeTab === 'signup' && (
                                    <div className="flex flex-col space-y-8 max-w-4xl p-2 w-full">
                                        {/* KYC Section */}
                                        <div className="border-l-[3px] border-orange-400 pl-4 space-y-2">
                                            <h3 className="text-xl font-bold text-gray-800">KYC</h3>
                                            <p className="text-sm text-gray-800 font-semibold mb-1">Aadhar Number: <span className="font-normal">{aadharNumber || "12345678901"}</span></p>
                                            <p className="text-sm text-gray-800 font-semibold mb-3">Consumer Number: <span className="font-normal">{lightBillNumber || "DB7784454MM"}</span></p>
                                            <button onClick={() => setActiveTab('kyc')} className="bg-[#0ea5e9] text-white text-xs font-semibold px-4 py-1.5 rounded-sm shadow-sm hover:bg-blue-600 transition-colors">
                                                Edit
                                            </button>
                                        </div>

                                        {/* Agreement Section */}
                                        <div className="border-l-[3px] border-orange-400 pl-4 space-y-2">
                                            <h3 className="text-xl font-bold text-gray-800">Agreement</h3>
                                            <p className="text-sm text-gray-800 font-semibold mb-3">Customer Agreement</p>
                                            <button onClick={() => setActiveTab('agreement')} className="bg-[#0ea5e9] text-white text-xs font-semibold px-4 py-1.5 rounded-sm shadow-sm hover:bg-blue-600 transition-colors">
                                                View
                                            </button>
                                        </div>

                                        {/* Location Section */}
                                        <div className="border-l-[3px] border-orange-400 pl-4 space-y-2">
                                            <h3 className="text-xl font-bold text-gray-800">Location</h3>
                                            <p className="text-sm text-gray-800 font-semibold mb-3">Address: <span className="font-normal">{locationAddress || "Narayan Nagar, Mavdi main road rajkot"}</span></p>
                                            <button onClick={() => setActiveTab('kyc')} className="bg-[#0ea5e9] text-white text-xs font-semibold px-4 py-1.5 rounded-sm shadow-sm hover:bg-blue-600 transition-colors">
                                                Edit
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-center pt-8 w-full">
                                            <button
                                                onClick={handleSignupComplete}
                                                className="bg-[#0ea5e9] text-white text-sm font-semibold px-6 py-2.5 rounded-sm hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                                            >
                                                Confirm Project Signup
                                            </button>

                                            <button className="bg-[#0ea5e9] text-white text-sm font-semibold px-6 py-2.5 rounded-sm shadow-sm hover:bg-blue-600 transition-colors">
                                                Apply For Loan
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'signup' && (
                                    <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-between items-center rounded-b-sm shrink-0 mt-4 w-full">
                                        <button
                                            onClick={() => setActiveTab('agreement')}
                                            className="bg-gray-500 hover:bg-gray-600 text-white text-xs font-semibold px-6 py-2 rounded-sm shadow-sm transition-colors">
                                            Previous
                                        </button>
                                        <button
                                            className="bg-[#60a5fa] hover:bg-blue-500 text-white text-xs font-semibold px-6 py-2 rounded-sm shadow-sm flex items-center transition-colors pointer-events-none"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                            <FileText size={64} className="mb-4 opacity-20" />
                            <h3 className="text-xl font-medium text-gray-500 max-w-md text-center">Select a project from the list to continue signup</h3>
                        </div>
                    )}
                </div>
            </div>

            {/* Choose Location Modal */}
            {showLocationModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-sm w-full max-w-[500px] shadow-2xl flex flex-col font-sans">
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-[#1f2937] tracking-tight">Select Location</h3>
                            <button
                                onClick={() => setShowLocationModal(false)}
                                className="text-gray-500 hover:text-gray-800 transition-colors"
                            >
                                <X size={20} className="font-bold stroke-[3]" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-1">Search Location</label>
                                <input
                                    type="text"
                                    placeholder="Enter address"
                                    className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#0ea5e9]"
                                />
                            </div>

                            {/* Map Placeholder */}
                            <div className="w-full aspect-square md:aspect-video rounded-sm overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center relative relative">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d118106.70010221669!2d70.73889449265747!3d22.273630793619566!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3959c98ac71cbd87%3A0xe1ebae40f9f40eb1!2sRajkot%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1714241617066!5m2!1sen!2sin"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-200 flex justify-end space-x-2 bg-gray-50">
                            <button
                                onClick={() => setShowLocationModal(false)}
                                className="bg-gray-500 text-white font-semibold text-xs px-4 py-2 rounded-sm hover:bg-gray-600 transition-colors shadow-sm"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => setShowLocationModal(false)}
                                className="bg-[#0b8bcc] text-white font-semibold text-xs px-4 py-2 rounded-sm hover:bg-[#0ea5e9] transition-colors shadow-sm"
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

export default DealerProjectSignup;