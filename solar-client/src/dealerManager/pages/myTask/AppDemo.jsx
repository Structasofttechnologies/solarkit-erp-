import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Search,
    RotateCw,
    Filter,
    Plus,
    Upload,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    X,
    Calendar,
    Video,
    Download,
    CheckCircle,
    Clock,
    Loader2
} from 'lucide-react';
import { getAppDemoLeads, scheduleAppDemo, createAppDemoLead } from '../../services/leadService';
import {
    getStatesHierarchy,
    getClustersHierarchy,
    getDistrictsHierarchy,
    getCitiesHierarchy,
    getDistricts
} from '../../../services/core/locationApi';

const DealerManagerAppDemo = () => {
    // State for modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

    // State for filters
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [dateRange, setDateRange] = useState('today');
    const [customDate, setCustomDate] = useState('');
    const [showCustomDate, setShowCustomDate] = useState(false);

    // State for search
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDistricts, setFilterDistricts] = useState([]);

    // State for recording
    const [isRecording, setIsRecording] = useState(false);
    const [recordedChunks, setRecordedChunks] = useState([]);
    const [showSummary, setShowSummary] = useState(false);
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);

    // State for schedule modal
    const [selectedLead, setSelectedLead] = useState(null);
    const [scheduleDate, setScheduleDate] = useState('');
    const [showScheduleSummary, setShowScheduleSummary] = useState(false);

    // State for action menu
    const [openActionMenu, setOpenActionMenu] = useState(null);

    // Form and Location States for Add Lead Modal
    const [leadForm, setLeadForm] = useState({
        name: 'CP test',
        phone: '7863806082',
        state: '',
        cluster: '',
        district: '',
        city: '',
        rural: '',
        sourceOfMedia: 'applead',
        profession: 'electrician'
    });

    const [states, setStates] = useState([]);
    const [clusters, setClusters] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [cities, setCities] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        getDistricts().then(res => setFilterDistricts(res || [])).catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (isAddModalOpen && states.length === 0) {
            getStatesHierarchy().then(res => setStates(res || [])).catch(err => console.error(err));
        }
    }, [isAddModalOpen]);

    const handleStateChange = async (e) => {
        const stateId = e.target.value;
        setLeadForm({ ...leadForm, state: stateId, cluster: '', district: '', city: '' });
        setClusters([]); setDistricts([]); setCities([]);
        if (stateId) {
            try {
                const res = await getClustersHierarchy(stateId);
                setClusters(res || []);
            } catch (error) { console.error(error); }
        }
    };

    const handleClusterChange = async (e) => {
        const clusterId = e.target.value;
        setLeadForm({ ...leadForm, cluster: clusterId, district: '', city: '' });
        setDistricts([]); setCities([]);
        if (clusterId) {
            try {
                const res = await getDistrictsHierarchy(clusterId);
                setDistricts(res || []);
            } catch (error) { console.error(error); }
        }
    };

    const handleDistrictChange = async (e) => {
        const districtId = e.target.value;
        setLeadForm({ ...leadForm, district: districtId, city: '' });
        setCities([]);
        if (districtId) {
            try {
                const res = await getCitiesHierarchy(districtId);
                setCities(res || []);
            } catch (error) { console.error(error); }
        }
    };

    const handleAddLeadSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!leadForm.name || !leadForm.phone || !leadForm.state) {
            alert('Please fill the required fields (Name, Phone, State)');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await createAppDemoLead(leadForm);
            if (res.success) {
                // Refresh list
                fetchDemoLeads();
                // Close modal and reset form
                setIsAddModalOpen(false);
                setLeadForm({
                    name: 'CP test',
                    phone: '7863806082',
                    state: '', cluster: '', district: '', city: '',
                    rural: '', sourceOfMedia: 'applead', profession: 'electrician'
                });
            }
        } catch (error) {
            console.error('Error creating demo lead:', error);
            alert(error.message || 'Failed to create lead');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Close action menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setOpenActionMenu(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const toggleActionMenu = (e, index) => {
        e.stopPropagation();
        setOpenActionMenu(openActionMenu === index ? null : index);
    };

    const handleViewAction = (lead) => {
        setOpenActionMenu(null);
        setSelectedLead(lead);
        setShowScheduleSummary(true);
        setShowSummary(true);
    };

    // State for leads data
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch leads
    useEffect(() => {
        fetchDemoLeads();
    }, []);

    const fetchDemoLeads = async () => {
        setLoading(true);
        try {
            const res = await getAppDemoLeads();
            if (res.success) {
                setLeads(res.data);
            }
        } catch (error) {
            console.error('Error fetching app demo leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateRangeChange = (e) => {
        const value = e.target.value;
        setDateRange(value);
        setShowCustomDate(value === 'custom');
    };

    const openScheduleModal = (lead) => {
        setSelectedLead(lead);
        setScheduleDate('');
        setShowScheduleSummary(false);
        setIsScheduleModalOpen(true);
    };

    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        if (scheduleDate && selectedLead) {
            try {
                const res = await scheduleAppDemo({
                    leadId: selectedLead._id,
                    scheduledDate: scheduleDate,
                    notes: ''
                });
                if (res.success) {
                    setShowScheduleSummary(true);
                    setShowSummary(true);
                    setIsScheduleModalOpen(false);
                    fetchDemoLeads(); // Refresh to update status
                }
            } catch (err) {
                console.error('Error scheduling demo', err);
                alert('Warning: API connection failed, but proceeding locally. Note that changes will not be saved.');
                setShowScheduleSummary(true);
                setShowSummary(true);
                setIsScheduleModalOpen(false);
            }
        }
    };

    const confirmSchedule = () => {
        // Now handled by form submit
    };

    // Screen Recording Functions
    const startRecording = async () => {
        try {
            // Check for HTTPS
            if (!window.isSecureContext) {
                alert('Screen recording requires HTTPS connection');
                return;
            }

            // Feature detection
            if (!navigator.mediaDevices?.getDisplayMedia) {
                alert('Screen recording not supported in this browser');
                return;
            }

            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });

            streamRef.current = stream;
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            const chunks = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);

                // Create download link
                const a = document.createElement('a');
                a.href = url;
                a.download = `recording-${Date.now()}.webm`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                // Cleanup
                stream.getTracks().forEach(track => track.stop());
                URL.revokeObjectURL(url);
                setRecordedChunks([]);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordedChunks(chunks);

        } catch (err) {
            console.error('Recording error:', err);
            alert(`Recording failed: ${err.message}`);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <div className="container-fluid px-4 py-4 bg-gray-50 min-h-screen">
            {/* Breadcrumb */}
            <div className="page-header mb-4">
                <nav className="flex" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-2 text-sm">
                        <li className="inline-flex items-center">
                            <Link to="/dealer-manager/app-demo" className="text-blue-600 hover:text-blue-800">
                                Dealer Manager App Demo
                            </Link>
                        </li>
                    </ol>
                </nav>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
                {/* Actions Bar */}
                <div className="p-4 border-b">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                            {/* Add Button */}
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="inline-flex items-center px-4 py-2 bg-[#0f4e8d] text-white rounded-full hover:bg-[#0a3a6b] transition-colors text-sm font-semibold"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                ADD
                            </button>

                            {/* Filter Button */}
                            <button
                                onClick={() => setIsFilterModalOpen(true)}
                                className="inline-flex items-center px-4 py-2 bg-[#0f4e8d] text-white rounded-full hover:bg-[#0a3a6b] transition-colors text-sm font-semibold"
                            >
                                <Filter className="w-4 h-4 mr-1" />
                                Filter
                            </button>

                            {/* Import Lead Button */}
                            <button className="inline-flex items-center px-4 py-2 bg-[#0f4e8d] text-white rounded-full hover:bg-[#0a3a6b] transition-colors text-sm font-semibold">
                                <Upload className="w-4 h-4 mr-1" />
                                Import Lead
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-md">
                            <div className="flex">
                                <input
                                    type="search"
                                    placeholder="Search by here"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200">
                                    <Search className="w-5 h-5 text-gray-600" />
                                </button>
                                <button className="ml-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100">
                                    <RotateCw className="w-5 h-5 text-red-500" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-[#0f4e8d] text-white">
                            <tr>
                                <th className="px-4 py-3 text-center font-medium text-xs">Actions</th>
                                <th className="px-4 py-3 text-center font-medium">SrNo.</th>
                                <th className="px-4 py-3 text-center font-medium">Status</th>
                                <th className="px-4 py-3 text-center font-medium">Lead Id</th>
                                <th className="px-4 py-3 text-center font-medium">Name</th>
                                <th className="px-4 py-3 text-center font-medium">Mobile No.</th>
                                <th className="px-4 py-3 text-center font-medium">Designation</th>
                                <th className="px-4 py-3 text-center font-medium">App Login?</th>
                                <th className="px-4 py-3 text-center font-medium">Screenshot Upload</th>
                                <th className="px-4 py-3 text-center font-medium">Schedule Demo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="11" className="px-6 py-8 text-center text-sm text-gray-500">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                                    </td>
                                </tr>
                            ) : leads.map((lead, index) => (
                                <tr key={lead._id} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-3 text-center">
                                        <div className="relative inline-block text-left">
                                            <button
                                                onClick={(e) => toggleActionMenu(e, index)}
                                                className="p-1 hover:bg-gray-100 rounded-full focus:outline-none"
                                            >
                                                <MoreVertical className="w-5 h-5 text-gray-500" />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {openActionMenu === index && (
                                                <div className="origin-top-right absolute left-full top-0 mt-0 ml-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                                                    <div className="py-1" role="menu" aria-orientation="vertical">
                                                        <button
                                                            onClick={() => handleViewAction(lead)}
                                                            className="flex px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                                            role="menuitem"
                                                        >
                                                            View Demo Details
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center text-xs">{index + 1}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-block px-3 py-1 ${lead.demoStatus === 'New' ? 'bg-pink-500' : 'bg-green-500'} text-white text-xs rounded-full`}>
                                            {lead.demoStatus}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">{lead._id?.substring(0, 8)}</td>
                                    <td className="px-4 py-3 text-center">{lead.name}</td>
                                    <td className="px-4 py-3 text-center">{lead.mobile}</td>
                                    <td className="px-4 py-3 text-center">{lead.profession || 'N/A'}</td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                checked
                                                disabled
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-xs">Dt:{new Date(lead.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <input
                                            type="file"
                                            className="text-xs w-32 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {lead.demoStatus === 'Scheduled' ? (
                                            <span className="text-green-600 font-semibold text-xs">Scheduled: {new Date(lead.demoDate).toLocaleDateString()}</span>
                                        ) : (
                                            <button
                                                onClick={() => openScheduleModal(lead)}
                                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                                            >
                                                Schedule
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-4 py-3 border-t flex items-center justify-between">
                    <div className="text-sm text-gray-600">Showing {leads.length} entries</div>
                    <div className="flex items-center space-x-2">
                        <button className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50" disabled>
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">1</button>
                        <button className="px-3 py-1 border rounded hover:bg-gray-50">2</button>
                        <button className="px-3 py-1 border rounded hover:bg-gray-50">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Schedule Modal */}
            {isScheduleModalOpen && selectedLead && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md mx-4">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-semibold">Schedule App Demo</h4>
                                <button
                                    onClick={() => setIsScheduleModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleScheduleSubmit}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Lead Information
                                        </label>
                                        <div className="p-3 bg-gray-50 rounded border">
                                            <p className="text-sm"><strong>Lead ID:</strong> {selectedLead._id}</p>
                                            <p className="text-sm"><strong>Name:</strong> {selectedLead.name}</p>
                                            <p className="text-sm"><strong>Mobile:</strong> {selectedLead.mobile}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Select Date
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                            value={scheduleDate}
                                            onChange={(e) => setScheduleDate(e.target.value)}
                                            required
                                        />
                                    </div>

                                    {showScheduleSummary && (
                                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                            <h6 className="font-semibold text-blue-700 mb-2">Scheduled Summary:</h6>
                                            <p className="text-sm">
                                                <strong>Demo Scheduled On:</strong> {scheduleDate}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-2 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsScheduleModalOpen(false)}
                                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Confirm Schedule
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-xl font-bold text-gray-800">Add Lead</h4>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleAddLeadSubmit}>
                                <div className="mb-4">
                                    <h6 className="text-[#0f4e8d] font-semibold flex items-center">
                                        <span className="mr-2">▶</span> Lead
                                    </h6>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Channel Partner Lead No.</label>
                                        <input type="text" className="w-full p-2 border rounded bg-gray-100" value="CP/24-25/013" disabled />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date:</label>
                                        <input type="date" className="w-full p-2 border rounded" defaultValue={new Date().toISOString().split('T')[0]} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 border rounded"
                                            value={leadForm.name}
                                            onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone No. *</label>
                                        <input
                                            type="tel"
                                            className="w-full p-2 border rounded"
                                            value={leadForm.phone}
                                            onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                        <select
                                            className="w-full p-2 border rounded"
                                            value={leadForm.state}
                                            onChange={handleStateChange}
                                        >
                                            <option value="">Select State</option>
                                            {states.map(state => (
                                                <option key={state._id} value={state._id}>{state.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cluster</label>
                                        <select
                                            className="w-full p-2 border rounded"
                                            value={leadForm.cluster}
                                            onChange={handleClusterChange}
                                            disabled={!leadForm.state}
                                        >
                                            <option value="">Select Cluster</option>
                                            {clusters.map(cluster => (
                                                <option key={cluster._id} value={cluster._id}>{cluster.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                                        <select
                                            className="w-full p-2 border rounded"
                                            value={leadForm.district}
                                            onChange={handleDistrictChange}
                                            disabled={!leadForm.cluster}
                                        >
                                            <option value="">Select District</option>
                                            {districts.map(district => (
                                                <option key={district._id} value={district._id}>{district.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                        <select
                                            className="w-full p-2 border rounded"
                                            value={leadForm.city}
                                            onChange={(e) => setLeadForm({ ...leadForm, city: e.target.value })}
                                            disabled={!leadForm.district}
                                        >
                                            <option value="">Select City</option>
                                            {cities.map(city => (
                                                <option key={city._id} value={city._id}>{city.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Rural</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 border rounded"
                                            value={leadForm.rural}
                                            onChange={(e) => setLeadForm({ ...leadForm, rural: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Source Of Media</label>
                                        <select
                                            className="w-full p-2 border rounded"
                                            value={leadForm.sourceOfMedia}
                                            onChange={(e) => setLeadForm({ ...leadForm, sourceOfMedia: e.target.value })}
                                        >
                                            <option value="">Select Source Of Media</option>
                                            <option value="website">Website</option>
                                            <option value="applead">Application Lead</option>
                                            <option value="leadpartener">Lead Partner</option>
                                            <option value="fb">Facebook</option>
                                            <option value="whatsappmarketing">WhatsApp Marketing</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                                        <select
                                            className="w-full p-2 border rounded"
                                            value={leadForm.profession}
                                            onChange={(e) => setLeadForm({ ...leadForm, profession: e.target.value })}
                                        >
                                            <option value="">Select Profession</option>
                                            <option value="solardealer">Solar Dealer</option>
                                            <option value="electrician">Electrician</option>
                                            <option value="elecshop">Electrician shop</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                        disabled={isSubmitting}
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Modal */}
            {isFilterModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md mx-4">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-semibold">Filter Leads</h4>
                                <button onClick={() => setIsFilterModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* District Dropdown */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select District</label>
                                    <select
                                        className="w-full p-2 border rounded"
                                        value={selectedDistrict}
                                        onChange={(e) => setSelectedDistrict(e.target.value)}
                                    >
                                        <option value="">Choose district</option>
                                        {filterDistricts.map(district => (
                                            <option key={district._id} value={district.name}>{district.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date Range Dropdown */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Date Range</label>
                                    <select
                                        className="w-full p-2 border rounded"
                                        value={dateRange}
                                        onChange={handleDateRangeChange}
                                    >
                                        <option value="today">Today</option>
                                        <option value="yesterday">Yesterday</option>
                                        <option value="last7">Last 7 Days</option>
                                        <option value="last15">Last 15 Days</option>
                                        <option value="lastMonth">Last Month</option>
                                        <option value="custom">Custom Range</option>
                                    </select>
                                </div>

                                {/* Custom Date Picker */}
                                {showCustomDate && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Custom Date</label>
                                        <input
                                            type="date"
                                            className="w-full p-2 border rounded"
                                            value={customDate}
                                            onChange={(e) => setCustomDate(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button onClick={() => setIsFilterModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                                    Close
                                </button>
                                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recording Summary Card */}
            {showSummary && (
                <div className="row mt-4">
                    <div className="col-md-6 col-lg-5 col-xl-4">
                        <div className="bg-white rounded-xl shadow-lg border-0 my-4">
                            <div className="p-4">
                                <h5 className="font-bold mb-4 text-blue-600 flex items-center">
                                    <Video className="w-5 h-5 mr-2" />
                                    CPRM App Demo Summary
                                </h5>

                                <div className="mb-3">
                                    <span className="font-semibold">Lead Id:</span> ss/24-25/004
                                </div>

                                <div className="mb-3 border-t pt-3">
                                    <span className="font-semibold">App Login:</span>
                                    <span className="text-green-600 font-bold ml-2">Dt:{selectedLead ? new Date(selectedLead.createdAt).toLocaleDateString() : 'N/A'}</span>
                                </div>

                                <div className="mb-3">
                                    <span className="font-semibold">Demo Scheduled:</span>
                                    <span className="text-blue-600 font-bold ml-2">Dt:{scheduleDate || 'N/A'}</span>
                                </div>

                                <hr className="my-3" />

                                <div className="flex gap-3 mt-4">
                                    <button
                                        onClick={startRecording}
                                        disabled={isRecording}
                                        className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${isRecording
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700'
                                            }`}
                                    >
                                        Start Recording
                                    </button>
                                    <button
                                        onClick={stopRecording}
                                        disabled={!isRecording}
                                        className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${!isRecording
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-red-600 hover:bg-red-700'
                                            }`}
                                    >
                                        Stop Recording
                                    </button>
                                </div>

                                {isRecording && (
                                    <div className="mt-3 flex items-center text-red-500">
                                        <span className="relative flex h-3 w-3 mr-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                        </span>
                                        Recording in progress...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DealerManagerAppDemo;