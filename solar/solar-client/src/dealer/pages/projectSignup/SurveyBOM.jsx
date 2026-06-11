import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    MapPin,
    Grid,
    ChevronDown,
    FileText,
    User,
    Mail,
    Phone,
    Calendar,
    Home,
    Building2,
    CheckCircle,
    Clock,
    AlertCircle,
    X,
    Loader,
    Zap
} from 'lucide-react';
import { locationAPI, leadAPI, surveyAPI } from '../../../api/api';

const DealerSurveyBOM = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('All');
    const [districts, setDistricts] = useState([]);
    const [statusFilter, setStatusFilter] = useState('All');

    // Survey Modal State
    const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
    const [currentSurvey, setCurrentSurvey] = useState(null);
    const [currentLead, setCurrentLead] = useState(null);
    const [surveyLoading, setSurveyLoading] = useState(false);

    // Fetch districts
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
            const params = {
                search: searchTerm,
                district: selectedDistrict !== 'All' ? selectedDistrict : undefined,
            };
            const response = await leadAPI.getAllLeads(params);
            if (response.data && response.data.data) {
                setLeads(response.data.data);
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
    }, [searchTerm, selectedDistrict]);

    const filteredLeads = leads.filter(lead => {
        if (statusFilter === 'All') return true;
        return lead.status === statusFilter;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return 'bg-blue-100 text-blue-700';
            case 'SurveyPending': return 'bg-yellow-100 text-yellow-700';
            case 'SurveyCompleted': return 'bg-green-100 text-green-700';
            case 'QuoteGenerated': return 'bg-purple-100 text-purple-700';
            case 'ProjectStart': return 'bg-orange-100 text-orange-700';
            case 'ProjectSigned': return 'bg-teal-100 text-teal-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const handleSurveyClick = async (lead) => {
        setCurrentLead(lead);
        setSurveyLoading(true);
        setIsSurveyModalOpen(true);
        try {
            const response = await surveyAPI.getSurveyByLead(lead._id);
            if (response.data && response.data.data) {
                setCurrentSurvey(response.data.data);
            } else {
                // No survey exists yet, create a dummy local object or handle empty
                setCurrentSurvey({ status: 'Pending', details: {} });
            }
        } catch (error) {
            console.error("Error fetching survey:", error);
            alert("Failed to load survey details");
            setIsSurveyModalOpen(false);
        } finally {
            setSurveyLoading(false);
        }
    };

    const handleUpdateSurveyStatus = async (status) => {
        if (!currentLead) return;

        try {
            if (status === 'Completed') {
                // Complete Survey Workflow
                await surveyAPI.completeSurvey(currentLead._id);
                // Also update local cache or refetch
                alert("Survey Completed Successfully! Redirecting to Project Signup...");
                setIsSurveyModalOpen(false);
                fetchLeads();
                // Redirect to Project Signup
                navigate('/dealer/project-signup/project-signup');
            } else {
                // Just update status to Pending (or save progress)
                await surveyAPI.createOrUpdateSurvey(currentLead._id, { status: 'Pending' });
                // Update Lead Status to SurveyPending if it's currently New
                if (currentLead.status === 'New') {
                    await leadAPI.updateLead(currentLead._id, { status: 'SurveyPending' });
                }
                alert("Survey saved as Pending.");
                setIsSurveyModalOpen(false);
                fetchLeads();
            }
        } catch (error) {
            console.error(`Error updating survey to ${status}:`, error);
            alert(`Failed to update survey: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Progress Steps */}
            <div className="mb-6 bg-white shadow-sm border-b overflow-x-auto">
                <div className="container-fluid px-6 py-4">
                    <div className="flex justify-between items-center min-w-[600px] relative">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-[10%] right-[10%] h-[2px] bg-gray-200 -z-10 transform -translate-y-1/2"></div>

                        {/* Steps */}
                        <div className="flex flex-col items-center flex-1 z-10 bg-white px-2">
                            <div className="w-8 h-8 rounded-full bg-yellow-400 text-white flex items-center justify-center font-bold text-sm mb-2 shadow-sm">1</div>
                            <span className="text-xs text-yellow-500 font-semibold">Select Kit</span>
                        </div>
                        <div className="flex flex-col items-center flex-1 z-10 bg-white px-2">
                            <div className="w-8 h-8 rounded-full bg-yellow-400 text-white flex items-center justify-center font-bold text-sm mb-2 shadow-sm">2</div>
                            <span className="text-xs text-yellow-500 font-semibold">Survey BOM</span>
                        </div>
                        <div className="flex flex-col items-center flex-1 z-10 bg-white px-2">
                            <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold text-sm mb-2 shadow-sm">3</div>
                            <span className="text-xs text-gray-500 font-medium">Project Quote</span>
                        </div>
                        <div className="flex flex-col items-center flex-1 z-10 bg-white px-2">
                            <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold text-sm mb-2 shadow-sm">4</div>
                            <span className="text-xs text-gray-500 font-medium">Project Signup</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-fluid px-6">
                {/* Search & Filters */}
                <div className="bg-white rounded-md shadow-sm mb-6 border border-gray-200">
                    {/* Search row */}
                    <div className="p-3 border-b border-gray-100 flex items-center">
                        <Search className="text-gray-400 mr-2" size={18} />
                        <input
                            type="text"
                            className="w-full py-1 focus:outline-none text-sm text-gray-700"
                            placeholder="Search leads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Filters row */}
                    <div className="flex p-3 text-sm">
                        <div className="flex-1 flex px-4 items-center border-r border-gray-200">
                            <span className="text-gray-500 mr-2 whitespace-nowrap">* Status:</span>
                            <div className="relative w-full">
                                <select
                                    className="bg-transparent focus:outline-none text-gray-700 w-full appearance-none cursor-pointer pr-6"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="All">All</option>
                                    <option value="New">New</option>
                                    <option value="SurveyPending">Survey Pending</option>
                                    <option value="SurveyCompleted">Survey Completed</option>
                                    <option value="QuoteGenerated">Quote Generated</option>
                                </select>
                                <ChevronDown className="text-gray-400 absolute right-0 top-1 pointer-events-none" size={14} />
                            </div>
                        </div>
                        <div className="flex-1 flex px-4 items-center border-r border-gray-200">
                            <span className="text-gray-500 mr-2 whitespace-nowrap">District:</span>
                            <div className="relative w-full">
                                <select
                                    className="bg-transparent focus:outline-none text-gray-700 w-full appearance-none cursor-pointer pr-6"
                                    value={selectedDistrict}
                                    onChange={(e) => setSelectedDistrict(e.target.value)}
                                >
                                    <option value="All">All</option>
                                    {districts.map(d => (
                                        <option key={d._id} value={d._id}>{d.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="text-gray-400 absolute right-0 top-1 pointer-events-none" size={14} />
                            </div>
                        </div>
                        <div className="flex-1 flex px-4 items-center">
                            <span className="text-gray-500 mr-2 whitespace-nowrap">Project Type:</span>
                            <div className="relative w-full">
                                <select className="bg-transparent focus:outline-none text-gray-700 w-full appearance-none cursor-pointer pr-6">
                                    <option value="All">All</option>
                                    <option value="Residential">Residential</option>
                                    <option value="Commercial">Commercial</option>
                                </select>
                                <ChevronDown className="text-gray-400 absolute right-0 top-1 pointer-events-none" size={14} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader className="animate-spin text-blue-500" size={40} />
                    </div>
                ) : filteredLeads.length === 0 ? (
                    <div className="text-center text-gray-500 py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                        <FileText size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="text-xl font-medium">No leads found matching your filters</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden mb-8">
                        <div className="bg-[#0ea5e9] text-white px-4 py-3 font-semibold text-sm">
                            Survey Leads
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-[#7dd3fc] text-white">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Lead Information</th>
                                        <th className="px-4 py-3 font-semibold">Location</th>
                                        <th className="px-4 py-3 font-semibold">Project</th>
                                        <th className="px-4 py-3 font-semibold text-center">Status</th>
                                        <th className="px-4 py-3 font-semibold">Date</th>
                                        <th className="px-4 py-3 font-semibold text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredLeads.map((lead) => (
                                        <tr key={lead._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0 mr-3 overflow-hidden">
                                                        <img src={`https://ui-avatars.com/api/?name=${lead.name.replace(' ', '+')}&background=random`} alt="Avatar" className="h-full w-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-800">{lead.name}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5">{lead.email || `${lead.name.split(' ')[0].toLowerCase()}@example.com`}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-gray-800 font-medium">{lead.district?.name || 'Unknown'}</div>
                                                <div className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{lead.city?.name || '-'}, {lead.district?.name || '-'}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold text-white mb-1 ${lead.solarType === 'Residential' ? 'bg-[#0ea5e9]' : 'bg-[#22c55e]'}`}>
                                                    {lead.solarType}
                                                </span>
                                                <div className="text-xs text-[#0ea5e9] font-medium">{lead.kw} KW</div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold text-white ${lead.status === 'Completed' || lead.status === 'SurveyCompleted' ? 'bg-[#22c55e]' :
                                                        lead.status === 'Pending' || lead.status === 'SurveyPending' ? 'bg-[#facc15]' : 'bg-[#0ea5e9]'
                                                    }`}>
                                                    {lead.status === 'SurveyPending' ? 'Pending' : lead.status === 'SurveyCompleted' ? 'Completed' : lead.status === 'New' ? 'In Progress' : lead.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 text-xs font-medium">
                                                {new Date(lead.createdAt).toISOString().split('T')[0]}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => handleSurveyClick(lead)}
                                                    className="bg-[#0ea5e9] hover:bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded flex items-center justify-center mx-auto transition-colors"
                                                >
                                                    <FileText size={12} className="mr-1" /> Survey
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Survey Modal */}
            {isSurveyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-800">
                                Survey Details: {currentLead?.name}
                            </h3>
                            <button
                                onClick={() => setIsSurveyModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            {surveyLoading ? (
                                <div className="flex justify-center py-10">
                                    <Loader className="animate-spin text-blue-500" size={30} />
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <span className="block text-xs text-gray-500 mb-1">Mobile</span>
                                            <span className="font-medium text-gray-800">{currentLead?.mobile}</span>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <span className="block text-xs text-gray-500 mb-1">Location</span>
                                            <span className="font-medium text-gray-800">{currentLead?.district?.name}, {currentLead?.city?.name}</span>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <span className="block text-xs text-gray-500 mb-1">System Type</span>
                                            <span className="font-medium text-gray-800">{currentLead?.solarType} - {currentLead?.subType}</span>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <span className="block text-xs text-gray-500 mb-1">Capacity</span>
                                            <span className="font-medium text-gray-800">{currentLead?.kw} KW</span>
                                        </div>
                                    </div>

                                    {/* Dynamic Survey Form Placeholder */}
                                    <div className="border rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-700 mb-3">Site Survey Questions</h4>
                                        <div className="space-y-3">
                                            {/* We can add dynamic form fields here later based on BOM/Survey model */}
                                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                <span className="text-sm text-gray-600">Roof Type</span>
                                                <span className="text-sm font-medium">Flat / Concrete</span>
                                            </div>
                                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                <span className="text-sm text-gray-600">Shadow Free Area</span>
                                                <span className="text-sm font-medium">Yes - 100%</span>
                                            </div>
                                            <div className="text-center text-sm text-gray-400 italic mt-2">
                                                Detailed survey form fields will be loaded dynamically here.
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-4 pt-4">
                                        <button
                                            onClick={() => handleUpdateSurveyStatus('Pending')}
                                            className="flex-1 py-2.5 px-4 bg-yellow-50 text-yellow-700 font-semibold rounded-lg hover:bg-yellow-100 transition-colors border border-yellow-200"
                                        >
                                            Survey Pending
                                        </button>
                                        <button
                                            onClick={() => handleUpdateSurveyStatus('Completed')}
                                            className="flex-1 py-2.5 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                                        >
                                            Survey Completed
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DealerSurveyBOM;