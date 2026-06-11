import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Phone,
    Mail,
    MapPin,
    Zap,
    Home,
    Building2,
    Sun,
    Battery,
    Globe,
    X,
    ChevronRight,
    Loader
} from 'lucide-react';
import { locationAPI, leadAPI } from '../../../api/api';

const DealerLead = () => {
    const [leads, setLeads] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal form state
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        whatsapp: '',
        email: '',
        district: '',
        districtName: '',
        city: '',
        cityName: '',
        solarType: 'Residential',
        subType: 'onGrid',
        kw: '',
        billAmount: 0
    });

    const [districts, setDistricts] = useState([]);
    const [citiesList, setCitiesList] = useState([]);

    // Fetch districts on mount
    useEffect(() => {
        const fetchDistricts = async () => {
            try {
                const response = await locationAPI.getAllDistricts({ isActive: true });
                if (response.data && response.data.data) {
                    setDistricts(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching districts:", error);
            }
        };
        fetchDistricts();
    }, []);

    // Fetch leads
    const fetchLeads = async () => {
        setLoading(true);
        try {
            const response = await leadAPI.getAllLeads({ search: searchTerm });
            if (response.data && response.data.data) {
                setLeads(response.data.data);
                if (response.data.data.length > 0 && !selectedLead) {
                    setSelectedLead(response.data.data[0]);
                } else if (response.data.data.length === 0) {
                    setSelectedLead(null);
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

    // Handle form input changes
    const handleInputChange = async (e) => {
        const { id, value } = e.target;

        if (id === 'district') {
            const selectedDistrict = districts.find(d => d._id === value);
            setFormData(prev => ({
                ...prev,
                district: value,
                districtName: selectedDistrict ? selectedDistrict.name : '',
                city: '',
                cityName: ''
            }));

            // Fetch cities for this district
            setCitiesList([]);
            if (value) {
                try {
                    const response = await locationAPI.getAllClusters({ district: value, isActive: true }); // Using Clusters as Cities
                    if (response.data && response.data.data) {
                        setCitiesList(response.data.data);
                    }
                } catch (error) {
                    console.error("Error fetching cities:", error);
                }
            }
        } else if (id === 'city') {
            const selectedCity = citiesList.find(c => c._id === value);
            setFormData(prev => ({
                ...prev,
                city: value,
                cityName: selectedCity ? selectedCity.name : ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [id]: value
            }));
        }
    };

    const handleRadioChange = (e) => {
        setFormData(prev => ({
            ...prev,
            subType: e.target.id
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await leadAPI.createLead(formData);
            setShowModal(false);
            setSearchTerm(''); // Clear search to show new lead if it matches
            fetchLeads(); // Refresh list
            // Reset form
            setFormData({
                name: '',
                mobile: '',
                whatsapp: '',
                email: '',
                district: '',
                districtName: '',
                city: '',
                cityName: '',
                solarType: 'Residential',
                subType: 'onGrid',
                kw: '',
                billAmount: 0
            });
        } catch (error) {
            console.error("Error creating lead:", error);
            alert("Failed to create lead. Please try again.");
        }
    };

    // Helper to format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Helper for status active check
    const isStepActive = (currentStatus, stepIndex) => {
        const statusMap = {
            'New': 0,
            'SurveyPending': 0,
            'SurveyCompleted': 1,
            'QuoteGenerated': 2,
            'ProjectStart': 3,
            'ProjectSigned': 4
        };
        const currentStepIndex = statusMap[currentStatus] || 0;
        return currentStepIndex >= stepIndex;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with Breadcrumb */}
            <div className="mb-4">
                <div className="bg-white shadow-sm p-3">
                    <nav className="container-fluid">
                        <ol className="flex items-center space-x-2">
                            <li className="text-gray-500">
                                <h3 className="text-xl font-semibold text-gray-800">Solar Kits</h3>
                            </li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div className="container-fluid px-4">
                <div className="flex flex-wrap h-[calc(100vh-140px)]">
                    {/* LEFT SIDE - Lead List */}
                    <div className="w-full md:w-1/4 border-r bg-white p-3 flex flex-col h-full rounded-l-xl shadow-sm">
                        {/* Search and Add Button */}
                        <div className="flex items-center mb-3">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Search Leads..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            </div>
                            <button
                                onClick={() => setShowModal(true)}
                                className="ml-2 bg-[#0ea5e9] hover:bg-blue-600 text-white px-3 py-2 rounded-md transition-colors text-xs font-semibold flex items-center"
                            >
                                <Plus size={14} className="mr-1" /> Add New<br />Lead
                            </button>
                        </div>

                        {/* Lead List */}
                        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                            {loading ? (
                                <div className="flex justify-center items-center py-10">
                                    <Loader className="animate-spin text-blue-500" size={24} />
                                </div>
                            ) : leads.length === 0 ? (
                                <div className="text-center text-gray-500 py-10 flex flex-col items-center">
                                    <Search size={32} className="mb-2 opacity-30" />
                                    <p>No leads found</p>
                                </div>
                            ) : (
                                leads.map((lead) => (
                                    <div
                                        key={lead._id}
                                        onClick={() => setSelectedLead(lead)}
                                        className={`p-3 rounded-md cursor-pointer transition-all ${selectedLead && selectedLead._id === lead._id
                                            ? 'bg-[#f0f9ff] border-2 border-[#0ea5e9]'
                                            : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'
                                            }`}
                                    >
                                        <div className="flex items-start">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 mt-1">
                                                <img src={`https://ui-avatars.com/api/?name=${lead.name.replace(' ', '+')}&background=random`} alt="Avatar" className="h-full w-full object-cover" />
                                            </div>
                                            <div className="ml-3 flex-1 overflow-hidden">
                                                <h4 className="text-sm font-medium text-gray-800 truncate" title={lead.name}>{lead.name}</h4>
                                                <div className="text-xs text-gray-500 truncate mt-0.5">+91 {lead.mobile}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    ({lead.kw} KW)
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex justify-between items-center">
                                            <div className="text-xs text-gray-500 truncate max-w-[100px]">
                                                {lead.district?.name || 'Unknown'}
                                            </div>
                                            <span className={`text-[10px] px-3 py-1 rounded-full font-semibold text-white ${lead.solarType === 'Residential'
                                                ? 'bg-[#22c55e]'
                                                : 'bg-[#0ea5e9]'
                                                }`}>
                                                {lead.solarType}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RIGHT SIDE - Lead Details */}
                    <div className="w-full md:w-3/4 bg-gray-50 p-6 flex-1 overflow-y-auto rounded-r-xl h-full">
                        {selectedLead ? (
                            <div className="animate-fade-in max-w-5xl mx-auto space-y-4">
                                {/* Customer Information */}
                                <div className="bg-white p-6 rounded-sm border border-gray-200 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Customer Information</h3>
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                                            <img src={`https://ui-avatars.com/api/?name=${selectedLead.name.replace(' ', '+')}&background=random`} alt="Avatar" className="h-full w-full object-cover" />
                                        </div>
                                        <div className="ml-4">
                                            <h4 className="text-base font-bold text-gray-800">{selectedLead.name}</h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                +91 {selectedLead.mobile}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Project Details */}
                                <div className="bg-white p-6 rounded-sm border border-gray-200 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Project Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">Panel Information: <span className="font-normal text-gray-600">{selectedLead.kw} Kw</span></p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">District: <span className="font-normal text-gray-600">{selectedLead.district?.name || '-'}</span></p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">Project Type: <span className="font-normal text-gray-600">{selectedLead.solarType}</span></p>
                                        </div>
                                    </div>
                                </div>

                                {/* Configuration Form */}
                                <div className="bg-white p-6 rounded-sm border border-gray-200 shadow-sm flex flex-col min-h-[350px]">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Technology</label>
                                            <select className="w-full p-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-600">
                                                <option value="">Select Technology</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Panel Wattage</label>
                                            <select className="w-full p-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-600">
                                                <option value="">Select Panel Wattage</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Number of Panels</label>
                                        <select className="w-full p-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-600">
                                            <option value="">Select number of panels</option>
                                        </select>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">System Capacity</label>
                                        <select className="w-full p-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-600">
                                            <option value="">Select System Capacity</option>
                                        </select>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Select Kit Type</label>
                                        <div className="flex items-center space-x-6">
                                            <label className="flex items-center cursor-pointer">
                                                <input type="radio" name="kitType" value="combo" className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500" defaultChecked />
                                                <span className="ml-2 text-sm text-gray-700">Combo Kits</span>
                                            </label>
                                            <label className="flex items-center cursor-pointer">
                                                <input type="radio" name="kitType" value="customized" className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500" />
                                                <span className="ml-2 text-sm text-gray-700">Customized Kits</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex justify-center mb-6">
                                        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center cursor-pointer">
                                            <Plus size={14} className="mr-1" /> Add Customized Kits
                                        </button>
                                    </div>

                                    <div className="mt-auto">
                                        <button className="w-full bg-[#facc15] hover:bg-[#eab308] text-black font-semibold py-3 rounded-md transition-colors text-sm">
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300">
                                <Search size={64} className="mb-4 opacity-50" />
                                <p className="text-xl font-medium text-gray-400">Select a lead to view details</p>
                                <p className="text-sm">or create a new one to get started</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal - Add New Lead */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-800">Add New Lead</h2>
                            <button onClick={() => setShowModal(false)} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors text-gray-500">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            {/* Personal Info */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 text-[10px]">1</span> Personal Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5 ">Full Name <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all focus:border-blue-500"
                                            placeholder="Enter customer name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number <span className="text-red-500">*</span></label>
                                        <input
                                            type="tel"
                                            id="mobile"
                                            value={formData.mobile}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all focus:border-blue-500"
                                            placeholder="Enter 10 digit number"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp Number</label>
                                        <input
                                            type="tel"
                                            id="whatsapp"
                                            value={formData.whatsapp}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all focus:border-blue-500"
                                            placeholder="Optional"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all focus:border-blue-500"
                                            placeholder="Optional"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-gray-100"></div>

                            {/* Location */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 text-[10px]">2</span> Location Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">District <span className="text-red-500">*</span></label>
                                        <select
                                            id="district"
                                            value={formData.district}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all focus:border-blue-500 bg-white"
                                            required
                                        >
                                            <option value="">Select District</option>
                                            {districts.map(d => (
                                                <option key={d._id} value={d._id}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">City / Cluster</label>
                                        <select
                                            id="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all focus:border-blue-500 bg-white"
                                            disabled={!formData.district}
                                        >
                                            <option value="">Select City</option>
                                            {citiesList.map(c => (
                                                <option key={c._id} value={c._id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-gray-100"></div>

                            {/* Solar Info */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 text-[10px]">3</span> Solar Requirements
                                </h3>
                                <div className="space-y-5">
                                    {/* Type Selection */}
                                    <div className="flex gap-4">
                                        <label className={`flex-1 p-4 border rounded-xl cursor-pointer transition-all ${formData.solarType === 'Residential' ? 'bg-green-50 border-green-500 text-green-700 shadow-sm' : 'hover:bg-gray-50 border-gray-200'
                                            }`}>
                                            <input
                                                type="radio"
                                                name="solarType"
                                                value="Residential"
                                                checked={formData.solarType === 'Residential'}
                                                onChange={(e) => setFormData({ ...formData, solarType: e.target.value })}
                                                className="hidden"
                                            />
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Home size={24} className={formData.solarType === 'Residential' ? 'text-green-600' : 'text-gray-400'} />
                                                <span className="font-semibold">Residential</span>
                                            </div>
                                        </label>
                                        <label className={`flex-1 p-4 border rounded-xl cursor-pointer transition-all ${formData.solarType === 'Commercial' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' : 'hover:bg-gray-50 border-gray-200'
                                            }`}>
                                            <input
                                                type="radio"
                                                name="solarType"
                                                value="Commercial"
                                                checked={formData.solarType === 'Commercial'}
                                                onChange={(e) => setFormData({ ...formData, solarType: e.target.value })}
                                                className="hidden"
                                            />
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Building2 size={24} className={formData.solarType === 'Commercial' ? 'text-blue-600' : 'text-gray-400'} />
                                                <span className="font-semibold">Commercial</span>
                                            </div>
                                        </label>
                                    </div>

                                    {/* Connection Type */}
                                    <div className="flex gap-4">
                                        <label className={`flex-1 p-3 border rounded-xl cursor-pointer transition-all ${formData.subType === 'onGrid' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'hover:bg-gray-50 border-gray-200'
                                            }`}>
                                            <input
                                                type="radio"
                                                id="onGrid"
                                                name="subType"
                                                checked={formData.subType === 'onGrid'}
                                                onChange={handleRadioChange}
                                                className="hidden"
                                            />
                                            <div className="flex items-center justify-center gap-2">
                                                <Sun size={20} className={formData.subType === 'onGrid' ? 'text-orange-500' : 'text-gray-400'} />
                                                <span className="font-medium">On Grid</span>
                                            </div>
                                        </label>
                                        <label className={`flex-1 p-3 border rounded-xl cursor-pointer transition-all ${formData.subType === 'offGrid' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'hover:bg-gray-50 border-gray-200'
                                            }`}>
                                            <input
                                                type="radio"
                                                id="offGrid"
                                                name="subType"
                                                checked={formData.subType === 'offGrid'}
                                                onChange={handleRadioChange}
                                                className="hidden"
                                            />
                                            <div className="flex items-center justify-center gap-2">
                                                <Battery size={20} className={formData.subType === 'offGrid' ? 'text-purple-500' : 'text-gray-400'} />
                                                <span className="font-medium">Off Grid/Hybrid</span>
                                            </div>
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Required Capacity (KW) <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                id="kw"
                                                value={formData.kw}
                                                onChange={handleInputChange}
                                                placeholder="e.g. 3.5"
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all focus:border-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Approx. Monthly Bill (₹)</label>
                                            <input
                                                type="number"
                                                id="billAmount"
                                                value={formData.billAmount}
                                                onChange={handleInputChange}
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all focus:border-blue-500"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 transform hover:-translate-y-0.5"
                            >
                                Create Lead
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DealerLead;